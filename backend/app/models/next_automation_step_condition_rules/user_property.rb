module NextAutomationStepConditionRules
  class UserProperty < NextAutomationStepConditionRule
    self.required_config_fields = %w[property operator]

    SUPPORTED_OPERATORS = %w[equals does_not_equal is_defined is_not_defined ends_with does_not_end_with starts_with does_not_start_with greater_than less_than greater_than_or_equal_to less_than_or_equal_to]
    OPERATORS_REQUIRING_VALUE = SUPPORTED_OPERATORS.reject { |op| %w[is_defined is_not_defined].include?(op) }

    validates :operator, inclusion: { in: SUPPORTED_OPERATORS }
    validate :has_value_config_if_operator_requires_it

    def is_satisfied_by_event?(prepared_event)
      case operator
      when 'equals'
        user_property_value(prepared_event) == expected_value
      when 'does_not_equal'
        user_property_value(prepared_event) != expected_value
      when 'is_defined'
        has_property?(prepared_event)
      when 'is_not_defined'
        !has_property?(prepared_event)
      when 'ends_with'
        return false if user_property_value(prepared_event).nil?
        user_property_value(prepared_event).ends_with?(expected_value)
      when 'does_not_end_with'
        return true if user_property_value(prepared_event).nil?
        !user_property_value(prepared_event).ends_with?(expected_value)
      when 'starts_with'
        return false if user_property_value(prepared_event).nil?
        user_property_value(prepared_event).starts_with?(expected_value)
      when 'does_not_start_with'
        return true if user_property_value(prepared_event).nil?
        !user_property_value(prepared_event).starts_with?(expected_value)
      when 'greater_than'
        return false if user_property_value(prepared_event).nil?
        user_property_value(prepared_event).to_f > expected_value.to_f
      when 'less_than'
        return false if user_property_value(prepared_event).nil?
        user_property_value(prepared_event).to_f < expected_value.to_f
      when 'greater_than_or_equal_to'
        return false if user_property_value(prepared_event).nil?
        user_property_value(prepared_event).to_f >= expected_value.to_f
      when 'less_than_or_equal_to'
        return false if user_property_value(prepared_event).nil?
        user_property_value(prepared_event).to_f <= expected_value.to_f
      else
        raise "Unsupported operator: #{operator}"
      end      
    end

    private

    def user_property_value(prepared_event)
      value = prepared_event.user_properties[formatted_event_property_key]
      return if value.nil?
      value.to_s.downcase.strip
    end

    def has_property?(prepared_event)
      prepared_event.user_properties.key?(formatted_event_property_key)
    end

    def formatted_event_property_key
      property.starts_with?('user.') ? property.split('.')[1..-1].join('.') : property
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