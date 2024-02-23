module Api
  module V1
    module Admin
      class IngestionController < BaseController
        include TimeseriesHelper

        def queueing
          queueing_timeseries = ClickHouseQueries::Admin::IngestionQueueingTimes.new(start_time: 3.day.ago, end_time: Time.current).timeseries
          render json: {
            timeseries: queueing_timeseries,
            start_time: 3.days.ago,
            end_time: Time.current,
            grouped_by: :minute,
          }, status: :ok
        end

        def queue_stats
          prepared_events = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.PREPARED_EVENTS)
          clickhouse_user_profiles = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.CLICK_HOUSE_USER_PROFILES)
          clickhouse_organization_profiles = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.CLICK_HOUSE_ORGANIZATION_PROFILES)
          clickhouse_organization_members = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.CLICK_HOUSE_ORGANIZATION_MEMBERS)

          capture_endpoint_dlq = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.CAPTURE_ENDPOINT_DLQ)
          events_to_prepare_dlq = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE_DLQ)
          prepared_events_dlq = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.PREPARED_EVENTS_DLQ)
          clickhouse_user_profiles_dlq = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.CLICK_HOUSE_USER_PROFILES_DLQ)
          clickhouse_organization_profiles_dlq = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.CLICK_HOUSE_ORGANIZATION_PROFILES_DLQ)
          clickhouse_organization_members_dlq = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.CLICK_HOUSE_ORGANIZATION_MEMBERS_DLQ)
          render json: {
            prepared_events_count: prepared_events,
            clickhouse_user_profiles_count: clickhouse_user_profiles,
            clickhouse_organization_profiles_count: clickhouse_organization_profiles,
            clickhouse_organization_members_count: clickhouse_organization_members,
            capture_endpoint_dlq_count: capture_endpoint_dlq,
            events_to_prepare_dlq_count: events_to_prepare_dlq,
            prepared_events_dlq_count: prepared_events_dlq,
            clickhouse_user_profiles_dlq_count: clickhouse_user_profiles_dlq,
            clickhouse_organization_profiles_dlq_count: clickhouse_organization_profiles_dlq,
            clickhouse_organization_members_dlq_count: clickhouse_organization_members_dlq,
          }, status: :ok
        end

        def event_counts
          render json: ClickHouseQueries::Admin::GlobalEventCountTimeseries.get.formatted_data, status: :ok
        end

        def ingestion_batches
          render json: IngestionBatch.all.limit(50).order(completed_at: :desc), status: :ok
        end
      end
    end
  end
end