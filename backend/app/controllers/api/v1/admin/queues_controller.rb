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