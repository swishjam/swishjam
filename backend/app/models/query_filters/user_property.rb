module QueryFilters
  class UserProperty < QueryFilter
    self.required_config_keys = %i[property_name operator property_value]
  end
end