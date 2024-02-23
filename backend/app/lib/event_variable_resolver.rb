module EventVariableResolver
  DOUBLE_BRACKET_REGEX = /\{\{([^}]+)\}\}/
  SINGLE_BRACKET_REGEX = /\{([^}]+)\}/
  def self.interpolated_text(text, prepared_event)
    double_bracket_resolved_variables = text.gsub(DOUBLE_BRACKET_REGEX) do |match|
      try_to_replace_regex_match_with_resolved_variable_value($1.strip, prepared_event)
    end
    resolved = double_bracket_resolved_variables.gsub(SINGLE_BRACKET_REGEX) do |match|
      try_to_replace_regex_match_with_resolved_variable_value($1.strip, prepared_event)
    end
    resolved
  end

  private

  def self.try_to_replace_regex_match_with_resolved_variable_value(possible_variable, prepared_event)
    resolved_variable_value = "{{ #{possible_variable} }}"
    possible_variable.split('||').each do |variable_name|
      resolved = get_resolved_variable_value_for_variable_name(variable_name.strip, prepared_event)
      if resolved.present?
        resolved_variable_value = resolved
        break
      end
    end
    resolved_variable_value
  end

  def self.get_resolved_variable_value_for_variable_name(variable_name, prepared_event)
    if variable_name.starts_with?('"') && variable_name.ends_with?('"') || variable_name.starts_with?("'") && variable_name.ends_with?("'")
      # '"there"' -> 'there'
      variable_name[1..-2]
    elsif variable_name.starts_with?('user.')
      user_property_name = variable_name.split('.').slice(1..-1).join('.')
      prepared_event.user_properties[user_property_name]
    else
      if variable_name.starts_with?('event.')
        variable_name = variable_name.split('.').slice(1..-1).join('.')
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