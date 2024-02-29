module Automations
  class Executor
    class InvalidExecutionError < StandardError; end
    attr_reader :automation, :prepared_event, :executed_automation, :as_test

    def initialize(automation:, prepared_event:, executed_automation: nil, as_test: false)
      @automation = automation
      @prepared_event = prepared_event
      @as_test = as_test
      @executed_automation = executed_automation || create_executed_automation!
    end

    def pick_back_up_automation_from_executed_automation_step!(executed_automation_step)
      execute_automation_steps_recursively!(executed_automation_step.automation_step, pre_existing_executed_automation_step: executed_automation_step)
      executed_automation
    end

    def execute_automation!
      execute_automation_steps_recursively!(sorted_automation_steps.first)
      executed_automation
    end

    private

    def sorted_automation_steps
      @sorted_automation_steps ||= automation.automation_steps.sort_by(&:sequence_index)
    end

    def execute_automation_steps_recursively!(automation_step, pre_existing_executed_automation_step: nil)
      executed_step = automation_step.execute!(prepared_event, executed_automation, executed_automation_step: pre_existing_executed_automation_step, as_test: as_test)
      if executed_step.completed?
        satisfied_next_step_conditions = satisfied_next_automation_step_conditions(automation_step, prepared_event)
        if satisfied_next_step_conditions.empty?
          executed_automation.completed!
        else
          satisfied_next_step_conditions.each do |condition|
            executed_step.satisfied_next_automation_step_conditions.create!({ next_automation_step_condition_id: condition.id })
            execute_automation_steps_recursively!(condition.next_automation_step)
          end
        end
      else
        # execution is still pending
        # assume the execution step handles completing it in the future and this will get picked up then?
      end
    end

    def satisfied_next_automation_step_conditions(automation_step, prepared_event)
      automation_step.next_automation_step_conditions.includes(:next_automation_step).select do |condition|
        condition.is_satisfied_by_event?(prepared_event)
      end
    end

    def create_executed_automation!
      return @executed_automation if @executed_automation.present?
      seconds_since_occurred_at = Time.current - prepared_event.occurred_at
      if seconds_since_occurred_at > (ENV['AUTOMATION_EXECUTION_LAG_WARNING_THRESHOLD_IN_SECONDS'] || 5.minutes).to_i
        msg = "Automation #{automation.id} took #{seconds_since_occurred_at} seconds to reach execution logic."
        Sentry.capture_message(msg)
        raise InvalidExecutionError, msg if ENV['DISABLE_AUTOMATION_WHEN_LAGGING']
      end
      @executed_automation = automation.executed_automations.create!(
        started_at: Time.current,
        executed_on_user_profile_id: prepared_event.user_profile_id,
        event_json: prepared_event.as_json,
        event_uuid: prepared_event.uuid,
        seconds_from_occurred_at_to_executed: seconds_since_occurred_at,
        is_test_execution: as_test,
      )
    end
  end
end