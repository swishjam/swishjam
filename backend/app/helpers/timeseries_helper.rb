module TimeseriesHelper
  def format_timeseries(timeseries_data, key_name = :date, value_name = :value)
    timeseries_data.map do |key, val|
      obj = {}
      obj[key_name] = key
      obj[value_name] = val
      obj
    end
  end


  def group_by_method
    raise "TimeseriesHelper needs `start_timestamp` defined in order to calculate the `group_by_method`" unless defined?(start_timestamp)
    case Time.current - start_timestamp
    when 0..(7.days + 1.minute)
      :group_by_hour
    when (7.days + 1.minute)..(1.month + 1.day)
      :group_by_day
    when (1.month + 1.day)..3.months
      :group_by_week
    else
      :group_by_month
    end
  end
end