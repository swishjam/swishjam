module AutomationJobs
  class ExecuteAutomation
    include Sidekiq::Worker
    queue_as :automations_queue

    sidekiq_retry_in do |count, exception|
      case exception
      when Automations::Executor::DelayedExecutionError
        :kill
      else
        10
      end
    end

    def perform(automation_id, prepared_event_json, options = {})
      as_test = options.with_indifferent_access.fetch(:as_test, false)
      automation = Automation.find(automation_id)
      automation.execute!(Ingestion::ParsedEventFromIngestion.new(prepared_event_json), as_test: as_test)
    end
  end
end