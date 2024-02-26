module ProfileTags
  class UserSegmentApplier
    attr_reader :user_segment, :workspace

    def initialize(user_segment, emit_events: true)
      @user_segment = user_segment
      @workspace = user_segment.workspace
      @emit_events = emit_events
      @data_sync = @user_segment.data_syncs.create!(workspace: @workspace, provider: "user_cohort_profile_tags", started_at: Time.current)
    end

    def update_user_segment_profile_tags!
      user_ids_in_segment = recursively_get_user_ids_for_user_segment
      current_user_ids_with_user_segment_profile_tag = workspace.analytics_user_profiles.joins(:profile_tags).where(profile_tags: { user_segment_id: user_segment.id, removed_at: nil }).pluck(:id)
      user_ids_to_add_profile_tag = user_ids_in_segment - current_user_ids_with_user_segment_profile_tag
      user_ids_to_remove_profile_tag = current_user_ids_with_user_segment_profile_tag - user_ids_in_segment
      update_user_segment_profile_tags_and_enqueue_events!(user_ids_to_add_profile_tag, user_ids_to_remove_profile_tag)
      @data_sync.completed!
      {
        user_ids_added: user_ids_to_add_profile_tag,
        num_users_added: user_ids_to_add_profile_tag.count,
        user_ids_removed: user_ids_to_remove_profile_tag,
        num_users_removed: user_ids_to_remove_profile_tag.count,
        data_sync_id: @data_sync.id,
      }
    end

    private

    def update_user_segment_profile_tags_and_enqueue_events!(user_ids_to_add_profile_tag, user_ids_to_remove_profile_tag)      
      users_to_add_profile_tag = workspace.analytics_user_profiles.where(id: user_ids_to_add_profile_tag)
      profile_tags_to_create = users_to_add_profile_tag.map do |user|
        { workspace_id: workspace.id, name: user_segment.profile_tag_name, user_segment_id: user_segment.id, profile_type: AnalyticsUserProfile.to_s, profile_id: user.id, applied_at: Time.current }
      end
      ProfileTag.insert_all!(profile_tags_to_create) if profile_tags_to_create.any?

      users_to_remove_profile_tag = workspace.analytics_user_profiles.where(id: user_ids_to_remove_profile_tag)
      profile_tags_to_remove = user_segment.profile_tags.where(profile: users_to_remove_profile_tag, removed_at: nil)
      profile_tags_to_remove.update_all(removed_at: Time.current) if profile_tags_to_remove.any?
      
      return if !@emit_events
      
      events = []
      users_to_add_profile_tag.each{ |user| events << event_for_ingestion(user, "added_to_cohort") }
      users_to_remove_profile_tag.each{ |user| events << event_for_ingestion(user, "removed_from_cohort") }
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
          user_id: user.user_unique_identifier,
          profile_type: 'user',
          profile_id: user.id,
          profile_name: user.full_name,
          profile_email: user.email,
          cohort_name: user_segment.name,
          tag_name: user_segment.profile_tag_name,
          cohort_id: user_segment.id,
        },
      )
    end

    def swishjam_api_key
      @swishjam_api_key ||= (workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.PRODUCT) || workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.MARKETING)).public_key
    end

    def recursively_get_user_ids_for_user_segment(user_ids: [], page: 1)
      results = get_user_ids_for_user_segment_page(page)
      user_ids.concat(results[:users].map { |u| u['swishjam_user_id'] })
      return user_ids if page >= results[:total_num_pages]
      recursively_get_user_ids_for_user_segment(user_ids: user_ids, page: page + 1)
    end

    def get_user_ids_for_user_segment_page(page)
      ClickHouseQueries::Users::List.new(
        user_segment.workspace_id, 
        filter_groups: user_segment.query_filter_groups.in_sequence_order.to_a,
        columns: ['swishjam_user_id'], 
        return_event_count_for_user_filter_counts: false,
        page: page, 
        limit: 1_000,
      ).get
    end
  end
end