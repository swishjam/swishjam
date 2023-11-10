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
          organization_identify_count = Ingestion::QueueManager.num_records_in_queue(Ingestion::QueueManager::Queues.ORGANIZATION)
          render json: {
            event_count: event_count,
            user_identify_count: user_identify_count,
            organization_identify_count: organization_identify_count,
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