module Ingestion
  class UserProfileClickHouseReplicationIngestion
    attr_accessor :ingestion_batch

    def initialize
      @ingestion_batch = IngestionBatch.new(started_at: Time.current, event_type: 'clickhouse_organization_profile_replication')
    end

    def self.ingest!
      new.ingest!
    end

    def ingest!
      formatted_profiles = Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.CLICKHOUSE_ORGANIZATION_PROFILES)
      byebug
      begin
        Analytics::SwishjamOrganizationProfile.insert_all!(formatted_profiles) if formatted_profiles.any?
        # formatted_profiles.map do |org_profile|
        #   {
        #     workspace_id: org_profile[:workspace_id],
        #     swishjam_api_key: org_profile[:swishjam_api_key],

        #   }
        # end
      rescue => e
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.CLICKHOUSE_ORGANIZATION_PROFILES_DEAD_LETTER_QUEUE, formatted_profiles)
        @ingestion_batch.error_message = e.message
        Rails.logger.error "Failed to ingest from analytics queue: #{e.inspect}"
        Sentry.capture_exception(e)
      end
      @ingestion_batch.num_records = formatted_profiles.count
      @ingestion_batch.completed_at = Time.current
      @ingestion_batch.num_seconds_to_complete = @ingestion_batch.completed_at - @ingestion_batch.started_at
      @ingestion_batch.save!

      @ingestion_batch
    end
  end
end