module Api
  module V1
    module Admin
      class QueuesController < BaseController
        HUMAN_NAME_TO_QUEUE_NAME_DICT = {
          'prepared_events_dlq' => Ingestion::QueueManager::Queues.PREPARED_EVENTS_DLQ,
          'events_to_prepare_dlq' => Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE_DLQ,
          'capture_endpoint_dlq' => Ingestion::QueueManager::Queues.CAPTURE_ENDPOINT_DLQ,
          'clickhouse_user_profiles_dlq' => Ingestion::QueueManager::Queues.CLICK_HOUSE_USER_PROFILES_DLQ,
          'clickhouse_organization_profiles_dlq' => Ingestion::QueueManager::Queues.CLICK_HOUSE_ORGANIZATION_PROFILES_DLQ,
          'clickhouse_organization_members_dlq' => Ingestion::QueueManager::Queues.CLICK_HOUSE_ORGANIZATION_MEMBERS_DLQ,
        }

        QUEUE_DESCRIPTIONS = {
          Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE_DLQ => "This queue contains events that failed during the preparation process of ingestion in the Ingestion::EventsPreparer class where events that were sent to capture are prepared for ClickHouse ingestion.",
        }
        
        def retry
          queue_name = HUMAN_NAME_TO_QUEUE_NAME_DICT[params[:queue_name]]
          if !queue_name
            render json: { error: "Queue not found" }, status: :not_found
            return
          end
          if params[:ALL_RECORDS] == 'true'
            num_records_in_queue = Ingestion::QueueManager.num_records_in_queue(queue_name)
            ingestion_batch = IngestionBatch.start!("#{queue_name}_retry", num_records: num_records_in_queue)
            IngestionJobs::RetryDeadLetterQueue.perform_async(queue_name, ingestion_batch.id)
            render json: {
              queue_name: queue_name,
              ingestion_batch: ingestion_batch.as_json,
            }
          elsif params[:records] || params[:record]
            records = (params[:records] || [params[:record]]).as_json
            ingestion_batch = nil
            case queue_name
            when Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE_DLQ
              ingestion_batch = Ingestion::DeadLetterQueueRetriers::EventsToPrepareDlq.new(records: records).retry!
            else
              render json: { error: "Retry logic for #{queue_name} not implemented" }, status: :not_implemented
              return
            end
            render json: { 
              queue_name: queue_name,
              num_successful_records: ingestion_batch.num_successful_records,
              num_failed_records: ingestion_batch.num_failed_records,
              num_records: ingestion_batch.num_records,
            }, status: :ok
          else
            render json: { error: "Request must include either a `record`, `records`, or `ALL_RECORDS` parameter" }, status: :bad_request
            return
          end
        end

        def destroy
          queue_name = HUMAN_NAME_TO_QUEUE_NAME_DICT[params[:queue_name]]
          if !queue_name
            render json: { error: "Queue not found" }, status: :not_found
            return
          end
          if params[:ALL_RECORDS] == 'true'
            num_records_in_queue = Ingestion::QueueManager.num_records_in_queue(queue_name)
            Ingestion::QueueManager.flush_queue!(queue_name)
            render json: { queue_name: queue_name, num_records_removed: num_records_in_queue }, status: :ok
          elsif params[:records] || params[:record]
            records = params[:records] || [params[:record]]
            num_records_removed = 0
            records.each do |record|
              num_records_removed += Ingestion::QueueManager.remove_record_from_queue(queue_name, record)
            end
            render json: { queue_name: queue_name, num_records_removed: num_records_removed }, status: :ok
          else
            render json: { error: "Request must include either a `record`, `records`, or `ALL_RECORDS` parameter" }, status: :bad_request
            return
          end
        end

        def show
          queue_name = HUMAN_NAME_TO_QUEUE_NAME_DICT[params[:name]]
          if !queue_name
            render json: { error: "Queue not found" }, status: :not_found
            return
          end
          page = (params[:page] || 1).to_i
          limit = (params[:limit] || 100).to_i
          total_count = Ingestion::QueueManager.num_records_in_queue(queue_name)
          records = Ingestion::QueueManager.read_all_records_from_queue(queue_name, offset: page - 1, num_records: limit)
          render json: { 
            name: queue_name,
            page: page,
            total_count: total_count,
            total_pages: (total_count / limit.to_f).ceil,
            records: records,
            description: QUEUE_DESCRIPTIONS[queue_name],
          }, status: :ok
        end
      end
    end
  end
end