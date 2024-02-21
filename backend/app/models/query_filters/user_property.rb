module QueryFilters
  class UserProperty < QueryFilter
    self.required_config_keys = %i[property_name operator]

    validates :operator, inclusion: { in: %w[is_generic_email is_not_generic_email is_defined is_not_defined contains does_not_contain equals does_not_equal greater_than less_than greater_than_or_equal_to less_than_or_equal_to] }
    validate :has_property_value_if_operator_requires_it
    validate :if_is_generic_operator_than_property_name_must_be_email

    def property_name
      config['property_name']
    end

    def operator
      config['operator']
    end

    def property_value
      config['property_value']
    end

    private

    def has_property_value_if_operator_requires_it
      if !%w[is_defined is_not_defined is_not_generic_email is_generic_email].include?(operator) && property_value.blank?
        errors.add(:base, "`property_value` query filter option is required for operator: #{operator}")
      end
    end

    def if_is_generic_operator_than_property_name_must_be_email
      if %w[is_generic_email is_not_generic_email].include?(operator)  && property_name != 'email'
        errors.add(:base, "`property_name` must be 'email' when using the `is/is not generic` operator. ")
      end
    end
  end
end