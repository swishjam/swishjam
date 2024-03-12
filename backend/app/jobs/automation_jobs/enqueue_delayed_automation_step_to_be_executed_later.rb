module AutomationJobs
  class EnqueueDelayedAutomationStepToBeExecutedLater
    include Sidekiq::Worker
    # this is the highest priority queue, does that make sense to use here?
    # also old naming convention but oh well
    queue_as :automations_queue

    def perform(prepared_event_json, executed_automation_step_id)
      executed_automation_step = ExecutedAutomationStep.find(executed_automation_step_id)
      executed_automation_step.execution_data['execute_immediately_on_next_execution'] = true
      executed_automation_step.save!
      Automations::Executor.new(
        automation: executed_automation_step.automation, 
        prepared_event: Ingestion::ParsedEventFromIngestion.new(prepared_event_json), 
        executed_automation: executed_automation_step.executed_automation,
        as_test: false, # this job should never be run as a test
      ).pick_back_up_automation_from_executed_automation_step!(executed_automation_step)
    end
  end
end