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
        raise InvalidConditionalStatement, "`property_value` is not defined for conditional statement: #{statement}" if statement['property_value'].blank? && !%w[is_defined is_not_defined].include?(statement['condition'])
        
        expected_value = statement['property_value'].to_s.downcase.strip

        event_or_user_property_value = nil
        if statement['property'].starts_with?('event.')
          event_property_name = statement['property'].split('.')[1..-1].join('.')
          event_or_user_property_value = prepared_event.properties[event_property_name]&.to_s&.downcase&.strip
        elsif statement['property'].starts_with?('user.')
          user_property_name = statement['property'].split('.')[1..-1].join('.')
          event_or_user_property_value = prepared_event.user_properties[user_property_name]&.to_s&.downcase&.strip
        else
          event_or_user_property_value = prepared_event.properties[statement['property']]&.to_s&.downcase&.strip
        end

        if statement['property'] === 'user_attributes' && prepared_event.user_properties[statement['property']].nil?
          # quick fix for all of Magic Patterns' event triggers which rely on the legacy `user_properties` key in the event properties
          event_or_user_property_value = prepared_event.user_properties.to_s.downcase.strip
        elsif statement['property'] === 'organization_attributes' && prepared_event.organization_properties[statement['property']].nil?
          event_or_user_property_value = prepared_event.organization_properties.to_s.downcase.strip
        end
        
        case statement['condition']
        when 'equals'
          return false if event_or_user_property_value.blank?
          event_or_user_property_value == expected_value
        when 'does_not_equal'
          return false if event_or_user_property_value.blank?
          event_or_user_property_value != expected_value
        when 'contains'
          return false if event_or_user_property_value.blank?
          event_or_user_property_value.include?(expected_value)
        when 'does_not_contain'
          return false if event_or_user_property_value.blank?
          !event_or_user_property_value.include?(expected_value)
        when 'ends_with'
          return false if event_or_user_property_value.blank?
          event_or_user_property_value.end_with?(expected_value)
        when 'does_not_end_with'
          return false if event_or_user_property_value.blank?
          !event_or_user_property_value.end_with?(expected_value)
        when 'is_defined'
          event_or_user_property_value.present?
        when 'is_not_defined'
          event_or_user_property_value.blank?
        when 'greater_than'
          return false if event_or_user_property_value.blank?
          event_or_user_property_value.to_f > expected_value.to_f
        when 'less_than'
          return false if event_or_user_property_value.blank?
          event_or_user_property_value.to_f < expected_value.to_f
        when 'greater_than_or_equal_to'
          return false if event_or_user_property_value.blank?
          event_or_user_property_value.to_f >= expected_value.to_f
        when 'less_than_or_equal_to'
          return false if event_or_user_property_value.blank?
          event_or_user_property_value.to_f <= expected_value.to_f
        else
          raise InvalidConditionalStatement, "Invalid condition provided: #{statement['condition']}"
        end
      end
    end
  end
end