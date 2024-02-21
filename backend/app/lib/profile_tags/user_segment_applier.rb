module ProfileTags
  class UserSegmentApplier
    attr_reader :user_segment, :workspace

    def initialize(user_segment, emit_events: true)
      @user_segment = user_segment
      @workspace = user_segment.workspace
      @emit_events = emit_events
      @data_sync = @user_segment.data_syncs.create!(workspace: @workspace, provider: "user_segment_profile_tags", started_at: Time.current)
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
      events = []
      user_ids_to_add_profile_tag.each do |user_id|
        user = workspace.analytics_user_profiles.find(user_id)
        tag = user.profile_tags.create!(workspace: workspace, name: user_segment.profile_tag_name, user_segment: user_segment)
        events << event_for_ingestion(tag, user, "added_to_segment") if @emit_events
      end
      user_ids_to_remove_profile_tag.each do |user_id|
        user = workspace.analytics_user_profiles.find(user_id)
        tag = user.profile_tags.find_by(removed_at: nil, user_segment: user_segment)
        tag.remove!
        events << event_for_ingestion(tag, user, "removed_from_segment") if @emit_events
      end
      return if events.empty? || !@emit_events
      IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter.perform_async(events)
    end

    def event_for_ingestion(tag, user, event_name)
      Ingestion::EventsPreparer.format_for_events_to_prepare_queue(
        uuid: "#{event_name}-#{tag.id}",
        swishjam_api_key: swishjam_api_key,
        name: "swishjam_bot.#{event_name}",
        occurred_at: Time.current.to_f,
        properties: {
          profile_type: 'user',
          profile_id: user.id,
          profile_name: user.full_name,
          profile_email: user.email,
          tag_name: user_segment.profile_tag_name,
          tag_id: tag.id,
          segment_id: user_segment.id,
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
        return_user_segment_event_counts: false,
        page: page, 
        limit: 1_000,
      ).get
    end
  end
end