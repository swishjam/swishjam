module DataMigrators
  class MoveUserColumnsToMetadataAndEnqueueAllProfilesToBeReplicatedIntoClickhouse
    def self.run!
      ActiveRecord::Base.logger.silence do
        start = Time.current
        users_to_update = AnalyticsUserProfile.where("jsonb_typeof(metadata) = 'object' OR metadata IS NULL")
                            .where.not(first_name: nil)
                            .or(AnalyticsUserProfile.where.not(last_name: nil))
                            .or(AnalyticsUserProfile.where.not(initial_landing_page_url: nil))
                            .or(AnalyticsUserProfile.where.not(initial_referrer_url: nil))
                            .or(AnalyticsUserProfile.where.not(gravatar_url: nil))
        puts "Merging #{users_to_update.count} users first_name and last_name columns into metadata...".colorize(:yellow)
        update_sql = <<~SQL
          metadata = jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  jsonb_set(
                    COALESCE(metadata, '{}'), 
                    '{first_name}', COALESCE(to_jsonb(first_name::text), '""')
                  ),
                  '{last_name}', COALESCE(to_jsonb(last_name::text), '""')
                ),
                '{initial_landing_page_url}', COALESCE(to_jsonb(#{AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL}::text), '""')
              ),
              '{initial_referrer_url}', COALESCE(to_jsonb(#{AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL}::text), '""')
            ),
            '{gravatar_url}', COALESCE(to_jsonb(#{AnalyticsUserProfile::ReservedMetadataProperties.GRAVATAR_URL}::text), '""')
          ),
          first_name = NULL,
          last_name = NULL,
          initial_landing_page_url = NULL,
          initial_referrer_url = NULL,
          gravatar_url = NULL
        SQL
        users_to_update.update_all(update_sql)

        puts "Flushing all records from the `CLICK_HOUSE_USER_PROFILES` queue...".colorize(:yellow)
        Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.CLICK_HOUSE_USER_PROFILES)

        all_users = AnalyticsUserProfile.all
        puts "Enqueuing all #{all_users.count} user profiles for replication into ClickHouse...".colorize(:yellow)
        Ingestion::QueueManager.push_records_into_queue(
          Ingestion::QueueManager::Queues.CLICK_HOUSE_USER_PROFILES, 
          all_users.map{ |u| u.send(:formatted_for_clickhouse_replication) }
        )
        puts "\nEnqueued #{all_users.count} user profiles for replication into ClickHouse.".colorize(:green)
        puts "Took #{Time.current - start} seconds".colorize(:grey)
      end
    end
  end
end