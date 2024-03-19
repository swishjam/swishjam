module Automations
  class Executor
    class InvalidExecutionError < StandardError; end
    class DelayedExecutionError < StandardError; end
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
      entry_point_step = automation.automation_steps.find_by(type: AutomationSteps::EntryPoint.to_s)
      execute_automation_steps_recursively!(entry_point_step)
      executed_automation
    end

    private

    def execute_automation_steps_recursively!(automation_step, pre_existing_executed_automation_step: nil)
      executed_step = automation_step.execute!(prepared_event, executed_automation, executed_automation_step: pre_existing_executed_automation_step, as_test: as_test)
      # assume the execution step handles completing it in the future and this will get picked up then?
      return if executed_step.pending?
      
      resolved_next_step_condition = first_satisfied_next_automation_step_condition(automation_step, prepared_event)
      append_logs_to_executed_step_based_on_resolved_next_step_condition(executed_step, resolved_next_step_condition)
      if resolved_next_step_condition.nil?
        executed_automation.completed!
      else
        executed_step.satisfied_next_automation_step_conditions.create!({ next_automation_step_condition_id: resolved_next_step_condition.id })
        execute_automation_steps_recursively!(resolved_next_step_condition.next_automation_step)
      end
    end

    def append_logs_to_executed_step_based_on_resolved_next_step_condition(executed_step, resolved_next_step_condition)
      if resolved_next_step_condition.nil?
        json_rules = executed_step.automation_step.next_automation_step_conditions.map do |condition|
          condition.next_automation_step_condition_rules.map(&:plain_english_description).join(' AND ')
        end
        executed_step.logs << Log.warn("No automation step satisfies the specified conditions, exiting automation...", json_rules)
      elsif !executed_step.automation_step.is_a?(AutomationSteps::EntryPoint)
        satisfied_rules_to_log = resolved_next_step_condition.next_automation_step_condition_rules.find_all { |rule| !rule.is_a?(NextAutomationStepConditionRules::AlwaysTrue) }.map(&:plain_english_description)
        executed_step.logs << Log.info("Continuing to #{resolved_next_step_condition.next_automation_step.friendly_type} automation step.#{satisfied_rules_to_log.count > 0 ? " Satisfied conditions:" : ''}", satisfied_rules_to_log)
      end
    end

    def first_satisfied_next_automation_step_condition(automation_step, prepared_event)
      automation_step.next_automation_step_conditions.includes(:next_automation_step).find do |condition|
        condition.is_satisfied_by_event?(prepared_event)
      end
    end

    def create_executed_automation!
      return @executed_automation if @executed_automation.present?
      seconds_since_occurred_at = Time.current - prepared_event.occurred_at
      if seconds_since_occurred_at > (ENV['AUTOMATION_EXECUTION_LAG_WARNING_THRESHOLD_IN_SECONDS'] || 10.minutes).to_i
        msg = "Automation #{automation.id} took #{seconds_since_occurred_at} seconds to reach execution logic."
        Sentry.capture_message(msg)
        raise DelayedExecutionError, msg if ENV['DISABLE_AUTOMATION_WHEN_LAGGING']
        if seconds_since_occurred_at > 6.hours.to_i
          raise DelayedExecutionError, "Automation #{automation.id} took #{seconds_since_occurred_at} seconds to reach execution logic, HAULTING EXECUTION."
        end
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