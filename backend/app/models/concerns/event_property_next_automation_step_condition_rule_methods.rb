module EventPropertyNextAutomationStepConditionRuleMethods
  extend ActiveSupport::Concern

  included do |base|
    # base.required_config_fields = %w[property value]

    def event_value(prepared_event)
      key = event_property_key.starts_with?('event.') ? event_property_key.split('.')[1..-1].join('.') : event_property_key
      value = prepared_event.event_properties[key]
      return if value.nil?
      value.to_s.downcase.strip
    end

    def has_property?(prepared_event)
      key = event_property_key.starts_with?('event.') ? event_property_key.split('.')[1..-1].join('.') : event_property_key
      prepared_event.event_properties.key?(key)
    end

    def expected_value
      config['value'].to_s.downcase.strip
    end

    def event_property_key
      config['property']
    end
  end
end