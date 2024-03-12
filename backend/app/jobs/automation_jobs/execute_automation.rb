module AutomationJobs
  class ExecuteAutomation
    include Sidekiq::Worker
    queue_as :automations_queue

    def perform(automation_id, prepared_event_json, options = {})
      as_test = options.with_indifferent_access.fetch(:as_test, false)
      automation = Automation.find(automation_id)
      automation.execute!(Ingestion::ParsedEventFromIngestion.new(prepared_event_json), as_test: as_test)
    end
  end
end