module Api
  module V1
    module Admin
      class IngestionController < BaseController
        def queueing
          diagnostics = ClickHouseQueries::Events::Diagnostics.new(start_time: 7.day.ago, end_time: Time.current, group_by: :minute).timeseries
          formatted_timeseries = diagnostics.map{ |e| { date: e.timeperiod, value: e.average_ingestion_time }}
          render json: formatted_timeseries, status: :ok
        end

        def queue_stats
          event_count = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.EVENTS)
          user_identify_count = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.IDENTIFY)
          organization_profile_count = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.ORGANIZATION)
          clickhouse_user_profile_count = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.CLICK_HOUSE_USER_PROFILES)
          clickhouse_organization_profile_count = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.CLICKHOUSE_ORGANIZATION_PROFILES)
          clickhouse_organization_member_count = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.CLICKHOUSE_ORGANIZATION_MEMBERS)
          user_profiles_from_events_count = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.USER_PROFILES_FROM_EVENTS)
          render json: {
            event_count: event_count,
            user_identify_count: user_identify_count,
            organization_profile_count: organization_profile_count,
            clickhouse_user_profile_count: clickhouse_user_profile_count,
            clickhouse_organization_profile_count: clickhouse_organization_profile_count,
            clickhouse_organization_member_count: clickhouse_organization_member_count,
            user_profiles_from_events_count: user_profiles_from_events_count,
          }, status: :ok
        end

        def event_counts
          render json: ClickHouseQueries::Events::GlobalCountTimeseries.get.formatted_data, status: :ok
        end

        def ingestion_batches
          render json: IngestionBatch.all.limit(50).order(completed_at: :desc), status: :ok
        end
      end
    end
  end
end