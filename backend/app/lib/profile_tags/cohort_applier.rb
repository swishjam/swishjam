module ProfileTags
  class CohortApplier
    attr_reader :cohort, :workspace

    def initialize(cohort, emit_events: true)
      @cohort = cohort
      @workspace = cohort.workspace
      @emit_events = emit_events
      @data_sync = @cohort.data_syncs.create!(workspace: @workspace, provider: "organization_cohort_profile_tags", started_at: Time.current)
    end

    def update_cohort_profile_tags!
      profile_ids_in_cohort = recursively_get_profile_ids_for_cohort
      current_profile_ids_with_cohort_profile_tag = cohort.profile_tags.where(removed_at: nil).pluck(:profile_id)
      profile_ids_to_add_profile_tag = profile_ids_in_cohort - current_profile_ids_with_cohort_profile_tag
      profile_ids_to_remove_profile_tag = current_profile_ids_with_cohort_profile_tag - profile_ids_in_cohort
      update_cohort_profile_tags_and_enqueue_events!(profile_ids_to_add_profile_tag, profile_ids_to_remove_profile_tag)
      @data_sync.completed!
      {
        profile_ids_added: profile_ids_to_add_profile_tag,
        num_users_added: profile_ids_to_add_profile_tag.count,
        profile_ids_removed: profile_ids_to_remove_profile_tag,
        num_users_removed: profile_ids_to_remove_profile_tag.count,
        data_sync_id: @data_sync.id,
      }
    end

    private

    def update_cohort_profile_tags_and_enqueue_events!(profile_ids_to_add_profile_tag, profile_ids_to_remove_profile_tag)
      profiles_to_add_profile_tag = workspace.send(is_user_cohort? ? :analytics_user_profiles : :analytics_organization_profiles).where(id: profile_ids_to_add_profile_tag)
      profile_tags_to_create = profiles_to_add_profile_tag.map do |profile|
        { 
          workspace_id: workspace.id, 
          name: cohort.profile_tag_name, 
          # we still have to user user_segment_id until we migrate the DB :/
          user_segment_id: cohort.id, 
          profile_type: is_user_cohort? ? AnalyticsUserProfile.to_s : AnalyticsOrganizationProfile.to_s,
          profile_id: profile.id, 
          applied_at: Time.current,
        }
      end
      ProfileTag.insert_all!(profile_tags_to_create) if profile_tags_to_create.any?

      profiles_to_remove_profile_tag = workspace.send(is_user_cohort? ? :analytics_user_profiles : :analytics_organization_profiles).where(id: profile_ids_to_remove_profile_tag)
      profile_tags_to_remove = cohort.profile_tags.where(profile: profiles_to_remove_profile_tag, removed_at: nil)
      profile_tags_to_remove.update_all(removed_at: Time.current) if profile_tags_to_remove.any?
      
      return if !@emit_events
      
      events = []
      profiles_to_add_profile_tag.each do |profile| 
        events << event_for_ingestion(profile, "added_to_cohort")
        events << event_for_ingestion(profile, "added_to_#{cohort.name.downcase.gsub(' ', '_').gsub('.', '_')}_cohort")
      end
      profiles_to_remove_profile_tag.each do |profile|
        events << event_for_ingestion(profile, "removed_from_cohort")
        events << event_for_ingestion(profile, "removed_from_#{cohort.name.downcase.gsub(' ', '_').gsub('.', '_')}_cohort")
      end
      return if events.empty?

      IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter.perform_async(events)
    end

    def event_for_ingestion(profile, event_name)
      properties = {
        profile_type: is_user_cohort? ? 'user' : 'organization',
        profile_id: profile.id,
        cohort_name: cohort.name,
        tag_name: cohort.profile_tag_name,
        cohort_id: cohort.id,
      }
      if is_user_cohort?
        # important so the event gets associated with the user
        properties[:user_id] = profile.user_unique_identifier
        properties[:user_full_name] = profile.full_name if profile.full_name.present?
        properties[:user_email] = profile.email
        properties[:user_unique_identifier] = profile.user_unique_identifier
        properties[:profile_name] = profile.full_name if profile.full_name.present?
        properties[:profile_email] = profile.email
        # so it gets attributed to the user during event preparation ingestion
        properties[:user] = { identifier: profile.user_unique_identifier }
      else
        # important so the event gets associated with the organization
        properties[:organization_id] = profile.organization_unique_identifier
        properties[:organization_name] = profile.name if profile.name.present?
        properties[:organization_unique_identifier] = profile.organization_unique_identifier
        properties[:profile_name] = profile.name if profile.name.present?
        # so it gets attributed to the organization during event preparation ingestion
        properties[:organization] = { identifier: profile.organization_unique_identifier }
      end
      # not idempotent...
      Ingestion::EventsPreparer.format_for_events_to_prepare_queue(
        uuid: SecureRandom.uuid,
        swishjam_api_key: swishjam_api_key,
        name: "swishjam_bot.#{event_name}",
        occurred_at: Time.current.to_f,
        properties: properties,
      )
    end

    def swishjam_api_key
      @swishjam_api_key ||= (workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.PRODUCT) || workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.MARKETING)).public_key
    end

    def recursively_get_profile_ids_for_cohort(profile_ids: [], page: 1)
      results = get_profile_ids_for_cohort_page(page)
      profile_ids.concat((results[:users] || results[:organizations]).map { |profile| profile['swishjam_user_id'] || profile['swishjam_organization_id'] })
      return profile_ids if page >= results[:total_num_pages]
      recursively_get_profile_ids_for_cohort(profile_ids: profile_ids, page: page + 1)
    end

    def get_profile_ids_for_cohort_page(page)
      list_klass = is_user_cohort? ? ClickHouseQueries::Users::List : ClickHouseQueries::Organizations::List
      list_klass.new(
        cohort.workspace_id, 
        filter_groups: cohort.query_filter_groups.in_sequence_order.to_a,
        columns: is_user_cohort? ? ['swishjam_user_id'] : ['swishjam_organization_id'], 
        return_event_count_for_profile_filter_counts: false,
        page: page, 
        limit: 1_000,
      ).get
    end

    def is_user_cohort?
      cohort.is_a?(Cohorts::UserCohort)
    end

    def is_organization_cohort?
      cohort.is_a?(Cohorts::OrganizationCohort)
    end
  end
end