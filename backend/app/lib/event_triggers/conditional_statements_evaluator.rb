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
        
        conditional_statements_specified_property_value = statement['property_value'].to_s.downcase.strip

        value_for_conditional_statements_specified_property = nil
        if statement['property'].starts_with?('event.')
          event_property_name = statement['property'].split('.')[1..-1].join('.')
          value_for_conditional_statements_specified_property = prepared_event.properties[event_property_name]&.to_s&.downcase&.strip
        elsif statement['property'].starts_with?('user.')
          user_property_name = statement['property'].split('.')[1..-1].join('.')
          value_for_conditional_statements_specified_property = prepared_event.user_properties[user_property_name]&.to_s&.downcase&.strip
        else
          value_for_conditional_statements_specified_property = prepared_event.properties[statement['property']]&.to_s&.downcase&.strip
        end

        if statement['property'] === 'user_attributes' && prepared_event.user_properties[statement['property']].nil?
          # quick fix for all of Magic Patterns' event triggers which rely on the legacy `user_properties` key in the event properties
          value_for_conditional_statements_specified_property = prepared_event.user_properties.to_s.downcase.strip
        elsif statement['property'] === 'organization_attributes' && prepared_event.organization_properties[statement['property']].nil?
          value_for_conditional_statements_specified_property = prepared_event.organization_properties.to_s.downcase.strip
        end
        
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
        when 'is_not_defined'
          value_for_conditional_statements_specified_property.blank?
        when 'greater_than'
          return false if value_for_conditional_statements_specified_property.blank?
          value_for_conditional_statements_specified_property.to_f > conditional_statements_specified_property_value.to_f
        when 'less_than'
          return false if value_for_conditional_statements_specified_property.blank?
          value_for_conditional_statements_specified_property.to_f < conditional_statements_specified_property_value.to_f
        when 'greater_than_or_equal_to'
          return false if value_for_conditional_statements_specified_property.blank?
          value_for_conditional_statements_specified_property.to_f >= conditional_statements_specified_property_value.to_f
        when 'less_than_or_equal_to'
          return false if value_for_conditional_statements_specified_property.blank?
          value_for_conditional_statements_specified_property.to_f <= conditional_statements_specified_property_value.to_f
        else
          raise InvalidConditionalStatement, "Invalid condition provided: #{statement['condition']}"
        end
      end
    end
  end
end