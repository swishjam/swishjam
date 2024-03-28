module QueryFilters
  class EventCountForUserOverTimePeriod < QueryFilter
    self.required_config_keys = %i[event_name num_lookback_days num_occurrences event_count_operator]
    validate { errors.add(:config, "Invalid event_count_operator") unless %w[less_than less_than_or_equal_to greater_than greater_than_or_equal_to].include?(event_count_operator_in_words) }

    def event_name
      config['event_name']
    end

    def num_lookback_days
      config['num_lookback_days']
    end

    def num_occurrences
      config['num_occurrences']
    end

    def event_count_operator_in_words
      config['event_count_operator']
    end

    def sql_event_count_operator
      case event_count_operator_in_words
      when 'less_than'
        '<'
      when 'greater_than'
        '>'
      when 'less_than_or_equal_to'
        '<='
      when 'greater_than_or_equal_to'
        '>='
      end
    end
  end
end