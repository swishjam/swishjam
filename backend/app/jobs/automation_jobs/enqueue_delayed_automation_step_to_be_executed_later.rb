module AutomationJobs
  class EnqueueDelayedAutomationStepToBeExecutedLater
    include Sidekiq::Worker
    # this is the highest priority queue, does that make sense to use here?
    # also old naming convention but oh well
    queue_as :event_triggers_queue

    def perform(prepared_event, executed_automation_step_id)
      executed_automation_step = AutomationStep.find(executed_automation_step_id)
      executed_automation_step.set_to_execute_immediately_on_next_execution!
      Automations::Executor.new(
        automation: executed_automation_step.automation, 
        prepared_event: prepared_event, 
        executed_automation: executed_automation_step.executed_automation,
        as_test: false, # this job should never be run as a test
      ).pick_back_up_automation_from_executed_automation_step!(executed_automation_step)
    end
  end
end