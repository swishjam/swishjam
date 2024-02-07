module EventVariableInterpolator
  def self.interpolated_text(text, prepared_event)
    text.gsub(/\{([^}]+)\}/) do |match|
      variable_name = $1.strip
      # default to the {variable} if not found
      resolved_variable_value = match 
      if variable_name.starts_with?('user.')
        user_property_name = variable_name.split('.').last
        resolved_variable_value = prepared_event.user_properties[user_property_name]
      else
        if variable_name.starts_with?('event.')
          variable_name = variable_name.split('.').last
        end
        resolved_variable_value = prepared_event.properties[variable_name]
        # technically people should use `user.` to access event.user_properties but for events created before that was a thing, we'll support it
        if resolved_variable_value.nil? && variable_name == 'user_attributes'
          resolved_variable_value = prepared_event.user_properties.to_s
        elsif resolved_variable_value.nil? && variable_name == 'organization_attributes'
          resolved_variable_value = prepared_event.organization_properties.to_s
        end
      end
      resolved_variable_value
    end
  end
end