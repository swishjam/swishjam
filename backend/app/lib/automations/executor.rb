module Automations
  class Executor
    class InvalidExecutionError < StandardError; end
    attr_reader :automation, :prepared_event, :executed_automation, :as_test

    def initialize(automation:, prepared_event:, executed_automation: nil, as_test: false)
      @automation = automation
      @prepared_event = prepared_event
      @executed_automation = executed_automation || create_executed_automation!
      @as_test = as_test
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
      executed_step = automation_step.execute!(prepared_event, executed_automation, executed_automation_step: pre_existing_executed_automation_step)
      if executed_step.completed?
        next_steps = next_automation_steps(automation_step, prepared_event)
        if next_steps.empty?
          executed_automation.completed!
        else
          next_steps.each do |next_step|
            execute_automation_steps_recursively!(next_step)
          end
        end
      else
        # execution is still pending
        # assume the execution step handles completing it in the future and this will get picked up then?
      end
    end

    def next_automation_steps(automation_step, prepared_event)
      automation_step.next_automation_step_conditions.select do |condition|
        condition.is_satisfied_by_event?(prepared_event)
      end.map(&:next_automation_step)
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
      )
    end
  end
end