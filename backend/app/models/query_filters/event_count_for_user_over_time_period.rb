module QueryFilters
  class EventCountForUserOverTimePeriod < QueryFilter
    self.required_config_keys = %i[event_name num_lookback_days num_occurrences]

    def event_name
      config['event_name']
    end

    def num_lookback_days
      config['num_lookback_days']
    end

    def num_occurrences
      config['num_occurrences']
    end
  end
end