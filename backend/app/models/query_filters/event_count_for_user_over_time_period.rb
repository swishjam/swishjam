module QueryFilters
  class EventCountForUserOverTimePeriod < QueryFilter
    self.required_config_keys = %i[event_name num_lookback_days num_occurrences]
  end
end