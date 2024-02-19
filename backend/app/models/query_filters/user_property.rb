module QueryFilters
  class UserProperty < QueryFilter
    self.required_config_keys = %i[property_name operator property_value]

    validates :operator, inclusion: { in: %w[is_defined is_not_defined contains does_not_contain equals does_not_equal greater_than less_than greater_than_or_equal_to less_than_or_equal_to] }

    def property_name
      config['property_name']
    end

    def operator
      config['operator']
    end

    def property_value
      config['property_value']
    end
  end
end