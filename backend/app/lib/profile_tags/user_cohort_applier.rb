module ProfileTags
  class UserCohortApplier
    attr_reader :cohort, :workspace

    def initialize(cohort, emit_events: true)
      @cohort = cohort
      @workspace = cohort.workspace
      @emit_events = emit_events
      @data_sync = @cohort.data_syncs.create!(workspace: @workspace, provider: "organization_cohort_profile_tags", started_at: Time.current)
    end

    def update_cohort_profile_tags!
      organization_ids_in_cohort = recursively_get_organization_ids_for_cohort
      current_organization_ids_with_cohort_profile_tag = workspace.analytics_organization_profiles.joins(:profile_tags).where(profile_tags: { cohort_id: cohort.id, removed_at: nil }).pluck(:id)
      organization_ids_to_add_profile_tag = organization_ids_in_cohort - current_organization_ids_with_cohort_profile_tag
      organization_ids_to_remove_profile_tag = current_organization_ids_with_cohort_profile_tag - organization_ids_in_cohort
      update_cohort_profile_tags_and_enqueue_events!(organization_ids_to_add_profile_tag, organization_ids_to_remove_profile_tag)
      @data_sync.completed!
      {
        organization_ids_added: organization_ids_to_add_profile_tag,
        num_users_added: organization_ids_to_add_profile_tag.count,
        organization_ids_removed: organization_ids_to_remove_profile_tag,
        num_users_removed: organization_ids_to_remove_profile_tag.count,
        data_sync_id: @data_sync.id,
      }
    end

    private

    def update_cohort_profile_tags_and_enqueue_events!(organization_ids_to_add_profile_tag, organization_ids_to_remove_profile_tag)      
      users_to_add_profile_tag = workspace.analytics_organization_profiles.where(id: organization_ids_to_add_profile_tag)
      profile_tags_to_create = users_to_add_profile_tag.map do |user|
        { workspace_id: workspace.id, name: cohort.profile_tag_name, cohort_id: cohort.id, profile_type: AnalyticsUserProfile.to_s, profile_id: user.id, applied_at: Time.current }
      end
      ProfileTag.insert_all!(profile_tags_to_create) if profile_tags_to_create.any?

      users_to_remove_profile_tag = workspace.analytics_organization_profiles.where(id: organization_ids_to_remove_profile_tag)
      profile_tags_to_remove = cohort.profile_tags.where(profile: users_to_remove_profile_tag, removed_at: nil)
      profile_tags_to_remove.update_all(removed_at: Time.current) if profile_tags_to_remove.any?
      
      return if !@emit_events
      
      events = []
      users_to_add_profile_tag.each do |user| 
        events << event_for_ingestion(user, "added_to_cohort")
        events << event_for_ingestion(user, "added_to_#{cohort.name.downcase.gsub(' ', '_').gsub('.', '_')}_cohort")
      end
      users_to_remove_profile_tag.each do |user| 
        events << event_for_ingestion(user, "removed_from_cohort")
        events << event_for_ingestion(user, "removed_from_#{cohort.name.downcase.gsub(' ', '_').gsub('.', '_')}_cohort")
      end
      return if events.empty?

      IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter.perform_async(events)
    end

    def event_for_ingestion(user, event_name)
      # not idempotent...
      Ingestion::EventsPreparer.format_for_events_to_prepare_queue(
        uuid: SecureRandom.uuid,
        swishjam_api_key: swishjam_api_key,
        name: "swishjam_bot.#{event_name}",
        occurred_at: Time.current.to_f,
        properties: {
          organization_id: user.organization_unique_identifier,
          profile_type: 'user',
          profile_id: user.id,
          profile_name: user.full_name,
          profile_email: user.email,
          cohort_name: cohort.name,
          tag_name: cohort.profile_tag_name,
          cohort_id: cohort.id,
        },
      )
    end

    def swishjam_api_key
      @swishjam_api_key ||= (workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.PRODUCT) || workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.MARKETING)).public_key
    end

    def recursively_get_organization_ids_for_cohort(organization_ids: [], page: 1)
      results = get_organization_ids_for_cohort_page(page)
      organization_ids.concat(results[:users].map { |u| u['swishjam_organization_id'] })
      return organization_ids if page >= results[:total_num_pages]
      recursively_get_organization_ids_for_cohort(organization_ids: organization_ids, page: page + 1)
    end

    def get_organization_ids_for_cohort_page(page)
      ClickHouseQueries::Organizations::List.new(
        cohort.workspace_id, 
        filter_groups: cohort.query_filter_groups.in_sequence_order.to_a,
        columns: ['swishjam_organization_id'], 
        return_event_count_for_profile_filter_counts: false,
        page: page, 
        limit: 1_000,
      ).get
    end
  end
end