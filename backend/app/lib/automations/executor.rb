module Automations
  class Executor
    attr_reader :automation, :prepared_event, :as_test

    def initialize(automation, prepared_event, as_test: false)
      @automation = automation
      @prepared_event = prepared_event
      @as_test = as_test
    end

    def execute_automation!
      automation.first_automation_step.execute_and_run_next_step_if_necessary!(prepared_event, executed_automation)
    end

    private

    def execute_automation_steps_recursively!(automation_step)
      executed_step = automation_step.executed_automation_steps.create!(started_at: Time.current)
      automation_step.execute_automation!(prepared_event, executed_step)
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

    def executed_automation
      @executed_automation ||= begin
        seconds_since_occurred_at = Time.current - prepared_event.occurred_at
        if seconds_since_occurred_at > (ENV['AUTOMATION_EXECUTION_LAG_WARNING_THRESHOLD'] || 60 * 5).to_i
          Sentry.capture_message("Automation #{automation.id} took #{seconds_since_occurred_at} seconds to reach execution logic.")
          return if ENV['DISABLE_AUTOMATION_WHEN_LAGGING']
        end
        automation.executed_automations.create!(
          started_at: Time.current,
          executed_on_user_profile_id: prepared_event.user_profile_id,
          event_json: prepared_event.as_json,
          event_uuid: prepared_event.uuid,
          seconds_from_occurred_at_to_executed: seconds_since_occurred_at,
        )
      end
    end
  end
end