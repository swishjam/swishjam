module Ingestion
  class EventsPreparer
    attr_accessor :ingestion_batch, :raw_events_to_prepare, :event_trigger_evaluator

    EVENT_NAMES_TO_NOT_WRITE_TO_EVENTS_TABLE = %w[*update_user].freeze
    EVENT_NAMES_NOT_ELIGIBLE_FOR_EVENT_TRIGGER_EVALUATION = %w[*update_user].freeze
    
    def self.format_for_events_to_prepare_queue(uuid:, swishjam_api_key:, name:, occurred_at:, properties:)
      {
        uuid: uuid,
        swishjam_api_key: swishjam_api_key,
        name: name,
        occurred_at: occurred_at.to_f,
        properties: properties,
      }
    end

    def initialize(raw_events_to_prepare, ingestion_batch: nil, update_ingestion_batch_every_n_iterations: 10)
      @ingestion_batch = ingestion_batch || IngestionBatch.start!('event_preparer', num_records: raw_events_to_prepare.count)
      @raw_events_to_prepare = raw_events_to_prepare
      @prepared_events_formatted_for_ingestion = []
      @failed_events = []
      @event_trigger_evaluator = EventTriggers::Evaluator.new
      @update_ingestion_batch_every_n_iterations = update_ingestion_batch_every_n_iterations
    end

    def prepare_events!
      raw_events_to_prepare.each{ |event_json| prepare_event!(event_json) }
      
      Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.PREPARED_EVENTS, @prepared_events_formatted_for_ingestion) if @prepared_events_formatted_for_ingestion.count > 0
      Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE_DLQ, @failed_events) if @failed_events.count > 0

      ingestion_batch.completed_at = Time.current
      ingestion_batch.num_seconds_to_complete = ingestion_batch.completed_at - ingestion_batch.started_at
      ingestion_batch.save!
      ingestion_batch
    end

    private

    def prepare_event!(event_json)
      event = Ingestion::ParsedEventFromIngestion.new(event_json)
      if event.name == 'sdk_error'
        Sentry.capture_message("SDK Error: #{event.properties.dig('error', 'message')}", level: 'error')
        return
      end
      event_preparer_klass = event_preparer_klass_for_event(event.name)
      prepared_event = event_preparer_klass.new(event).handle_and_return_prepared_events!
      prepared_events = prepared_event.is_a?(Array) ? prepared_event : [prepared_event]
      byebug
      prepared_events.each do |prepared_event|
        next if EVENT_NAMES_NOT_ELIGIBLE_FOR_EVENT_TRIGGER_EVALUATION.include?(prepared_event.name)
        event_trigger_evaluator.enqueue_event_trigger_jobs_that_match_event(prepared_event)
        Automations::Triggerer.enqueue_automation_execution_jobs_that_match_event(prepared_event)
      end
      prepared_events.each do |prepared_event|
        next if EVENT_NAMES_TO_NOT_WRITE_TO_EVENTS_TABLE.include?(prepared_event.name)
        @prepared_events_formatted_for_ingestion << prepared_event.formatted_for_ingestion
      end
      
      ingestion_batch.num_successful_records += prepared_events.count
      ingestion_batch.save! if (@update_ingestion_batch_every_n_iterations || 0) > 0 && (ingestion_batch.num_successful_records + ingestion_batch.num_failed_records) % @update_ingestion_batch_every_n_iterations == 0
    rescue => e
      Sentry.capture_message("Error preparing event into ingestion format during events ingestion, continuing with the rest of the events in the queue and pushing this one to the DLQ.\nerror: #{e.message}", level: 'error', extra: { event_json: event_json })
      event_json['dlq_data'] = { error_message: e.message, errored_at: Time.current }
      @failed_events << event_json
      ingestion_batch.num_failed_records += 1
      ingestion_batch.save! if (@update_ingestion_batch_every_n_iterations || 0) > 0 && (ingestion_batch.num_successful_records + ingestion_batch.num_failed_records) % @update_ingestion_batch_every_n_iterations == 0
    end

    def event_preparer_klass_for_event(event_name)
      if event_name == 'identify'
        Ingestion::EventPreparers::UserIdentifyHandler
      elsif event_name.starts_with?('stripe.')
        Ingestion::EventPreparers::StripeEventHandler
      elsif event_name.starts_with?('resend.')
        Ingestion::EventPreparers::ResendEventHandler
      elsif event_name.starts_with?('intercom.')
        Ingestion::EventPreparers::IntercomEventHandler
      elsif event_name.starts_with?('github.')
        Ingestion::EventPreparers::GithubEventHandler
      elsif event_name.starts_with?('cal.')
        Ingestion::EventPreparers::CalComEventHandler
      else
        Ingestion::EventPreparers::BasicEventHandler
      end
    end
  end
end