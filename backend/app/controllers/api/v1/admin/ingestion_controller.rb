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
          render json: {
            ingestion_queues: Ingestion::QueueManager::Queues.ingestion_queues.map do |queue| 
              {
                queue: queue,
                num_records_in_queue: Ingestion::QueueManager.num_records_in_queue(queue),
              }
            end,
            dead_letter_queues: Ingestion::QueueManager::Queues.dead_letter_queues.map do |queue| 
              {
                queue: queue,
                num_records_in_queue: Ingestion::QueueManager.num_records_in_queue(queue),
              }
            end,
            redis_stats: Ingestion::QueueManager.redis_stats,
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