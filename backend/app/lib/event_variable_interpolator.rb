module EventVariableInterpolator
  def self.interpolated_text(text, prepared_event)
    text.gsub(/\{([^}]+)\}/) do |match|
      variable_name = $1.strip
      resolved_variable_value = prepared_event.properties[variable_name]
      if resolved_variable_value.nil? && variable_name == 'user_attributes'
        resolved_variable_value = prepared_event.user_properties.to_s
      elsif resolved_variable_value.nil? && variable_name == 'organization_attributes'
        resolved_variable_value = prepared_event.organization_properties.to_s
      end
      resolved_variable_value || match
    end
  end
end