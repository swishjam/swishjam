module EventTriggers
  class ConditionalStatementsEvaluator
    class InvalidConditionalStatement < StandardError; end;
    attr_accessor :prepared_event

    def initialize(prepared_event)
      @prepared_event = prepared_event
    end

    def event_meets_all_conditions?(conditional_statements)
      conditional_statements.all? do |statement|
        raise InvalidConditionalStatement, "`property` is not defined for conditional statement: #{statement}" if statement['property'].blank?
        raise InvalidConditionalStatement, "`condition` is not defined for conditional statement: #{statement}" if statement['condition'].blank?
        raise InvalidConditionalStatement, "`property_value` is not defined for conditional statement: #{statement}" if statement['property_value'].blank? && statement['condition'] != 'is_defined'
        
        value_for_conditional_statements_specified_property = prepared_event.properties[statement['property']]&.to_s&.downcase&.strip
        conditional_statements_specified_property_value = statement['property_value'].to_s.downcase.strip
        case statement['condition']
        when 'equals'
          return false if value_for_conditional_statements_specified_property.blank?
          value_for_conditional_statements_specified_property == conditional_statements_specified_property_value
        when 'does_not_equal'
          return false if value_for_conditional_statements_specified_property.blank?
          value_for_conditional_statements_specified_property != conditional_statements_specified_property_value
        when 'contains'
          return false if value_for_conditional_statements_specified_property.blank?
          value_for_conditional_statements_specified_property.include?(conditional_statements_specified_property_value)
        when 'does_not_contain'
          return false if value_for_conditional_statements_specified_property.blank?
          !value_for_conditional_statements_specified_property.include?(conditional_statements_specified_property_value)
        when 'ends_with'
          return false if value_for_conditional_statements_specified_property.blank?
          value_for_conditional_statements_specified_property.end_with?(conditional_statements_specified_property_value)
        when 'does_not_end_with'
          return false if value_for_conditional_statements_specified_property.blank?
          !value_for_conditional_statements_specified_property.end_with?(conditional_statements_specified_property_value)
        when 'is_defined'
          value_for_conditional_statements_specified_property.present?
        else
          raise InvalidConditionalStatement, "Invalid condition provided: #{statement['condition']}"
        end
      end
    end
  end
end