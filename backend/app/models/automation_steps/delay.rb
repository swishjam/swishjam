module AutomationSteps
  class Delay < AutomationStep
    VALID_DELAY_UNITS = %w[minute minutes hour hours day days week weeks month months year years].freeze
    validate :has_valid_config

    def execute_automation!(prepared_event, executed_automation_step, as_test: false)
      if as_test
        executed_automation_step.execution_data['simulated_delayed_execution'] = true
        executed_automation_step.completed!
      elsif should_execute_immediately?
        # this step is being picked back up after being delayed, complete the step so the rest of the automation can continue
        executed_automation_step.execution_data['executed_delayed_execution_at'] = Time.current
        executed_automation_step.completed!
      else
        perform_job_in = delay_amount.send(delay_unit)
        executed_automation_step.execution_data['scheduled_to_be_executed_at'] = Time.current + perform_job_in
        executed_automation_step.save!
        AutomationJobs::EnqueueDelayedAutomationStepToBeExecutedLater.perform_in(perform_job_in, prepared_event, executed_automation_step.id)
      end
      executed_automation_step
    end

    def should_execute_immediately?
      execution_data['execute_immediately_on_next_execution']
    end

    def set_to_execute_immediately_on_next_execution!
      execution_data['execute_immediately_on_next_execution'] = true
    end

    def scheduled_to_be_executed_at
      execution_data['scheduled_to_be_executed_at']
    end

    def executed_delayed_execution_at
      execution_data['executed_delayed_execution_at']
    end

    def delay_amount
      config['delay_amount']
    end

    def delay_unit
      config['delay_unit']
    end

    private

    def has_valid_config
      if delay_amount.blank?
        errors.add(:config, 'delay_amount is required')
      end
      if delay_unit.blank?
        errors.add(:config, 'delay_unit is required')
      elsif !self.class::VALID_DELAY_UNITS.include?(delay_unit)
        errors.add(:config, "invalid delay_unit, must be one of: #{VALID_DELAY_UNITS.join(", ")}")
      end
    end
  end
end