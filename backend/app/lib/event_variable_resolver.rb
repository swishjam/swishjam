module EventVariableResolver
  def self.interpolated_text(text, prepared_event)
    text.gsub(/\{([^}]+)\}/) do |match|
      # default to the {variable} if not found
      resolved_variable_value = match
      $1.strip.split('||').each do |variable_name|
        resolved = get_resolved_variable_value_for_variable_name(variable_name.strip, prepared_event)
        if resolved.present?
          resolved_variable_value = resolved
          break
        end
      end 
      resolved_variable_value
    end
  end

  private

  def self.get_resolved_variable_value_for_variable_name(variable_name, prepared_event)
    if variable_name.starts_with?('"') && variable_name.ends_with?('"') || variable_name.starts_with?("'") && variable_name.ends_with?("'")
      # '"there"' -> 'there'
      variable_name[1..-2]
    elsif variable_name.starts_with?('user.')
      user_property_name = variable_name.split('.').last
      prepared_event.user_properties[user_property_name]
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
      resolved_variable_value
    end
  end
end