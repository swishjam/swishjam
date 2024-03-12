module NextAutomationStepConditionRules
  class EventProperty < NextAutomationStepConditionRule
    self.required_jsonb_fields :config, :property, :operator
    self.define_jsonb_methods :config, :property, :operator, :value

    SUPPORTED_OPERATORS = %w[equals does_not_equal contains does_not_contain is_defined is_not_defined ends_with does_not_end_with starts_with does_not_start_with greater_than less_than greater_than_or_equal_to less_than_or_equal_to]
    OPERATORS_REQUIRING_VALUE = SUPPORTED_OPERATORS.reject { |op| %w[is_defined is_not_defined].include?(op) }

    validates :operator, inclusion: { in: SUPPORTED_OPERATORS }
    validate :has_value_config_if_operator_requires_it

    def is_satisfied_by_event?(prepared_event)
      case operator
      when 'equals'
        event_value(prepared_event) == expected_value
      when 'does_not_equal'
        event_value(prepared_event) != expected_value
      when 'contains'
        return false if event_value(prepared_event).nil?
        event_value(prepared_event).include?(expected_value)
      when 'does_not_contain'
        return true if event_value(prepared_event).nil?
        !event_value(prepared_event).include?(expected_value)
      when 'is_defined'
        has_property?(prepared_event)
      when 'is_not_defined'
        !has_property?(prepared_event)
      when 'ends_with'
        return false if event_value(prepared_event).nil?
        event_value(prepared_event).ends_with?(expected_value)
      when 'does_not_end_with'
        return true if event_value(prepared_event).nil?
        !event_value(prepared_event).ends_with?(expected_value)
      when 'starts_with'
        return false if event_value(prepared_event).nil?
        event_value(prepared_event).starts_with?(expected_value)
      when 'does_not_start_with'
        return true if event_value(prepared_event).nil?
        !event_value(prepared_event).starts_with?(expected_value)
      when 'greater_than'
        return false if event_value(prepared_event).nil?
        event_value(prepared_event).to_f > expected_value.to_f
      when 'less_than'
        return false if event_value(prepared_event).nil?
        event_value(prepared_event).to_f < expected_value.to_f
      when 'greater_than_or_equal_to'
        return false if event_value(prepared_event).nil?
        event_value(prepared_event).to_f >= expected_value.to_f
      when 'less_than_or_equal_to'
        return false if event_value(prepared_event).nil?
        event_value(prepared_event).to_f <= expected_value.to_f
      else
        raise "Unsupported operator: #{operator}"
      end      
    end

    def plain_english_description
      if operator.starts_with?('greater_than') || operator.starts_with?('less_than')
        "If the event's #{property} property is #{operator.gsub('_', ' ')} #{value}."
      else
        "If the event's #{property} property #{operator.gsub('_', ' ')} #{value}."
      end
    end

    private

    def event_value(prepared_event)
      value = prepared_event.sanitized_properties[formatted_event_property_key]
      return if value.nil?
      value.to_s.downcase.strip
    end

    def has_property?(prepared_event)
      prepared_event.sanitized_properties.key?(formatted_event_property_key)
    end

    def formatted_event_property_key
      property.starts_with?('event.') ? property.split('.')[1..-1].join('.') : property
    end

    def expected_value
      value.to_s.downcase.strip
    end

    def has_value_config_if_operator_requires_it
      if value.blank? && self.class::OPERATORS_REQUIRING_VALUE.include?(operator)
        errors.add(:value, "can't be blank")
      end
    end
  end
end