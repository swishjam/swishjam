module TimeseriesHelper
  def format_timeseries(timeseries_data, key_name = :date, value_name = :value)
    timeseries_data.map do |key, val|
      obj = {}
      obj[key_name] = key
      obj[value_name] = val
      obj
    end
  end


  def derived_group_by(start_ts:, end_ts:)
    case end_ts - start_ts
    when 0..(7.days + 1.minute)
      :hour
    when (7.days + 1.minute)..(1.month + 1.day)
      :day
    when (1.month + 1.day)..3.months
      :week
    else
      :month
    end
  end

  def rounded_timestamps(start_ts:, end_ts:, group_by:)
    if ![:hour, :day, :week, :month].include?(group_by.to_sym)
      raise "Unknown group_by: #{group_by}. Expected one of: :hour, :day, :week, :month."
    end
    [start_ts.send(:"beginning_of_#{group_by}"), end_ts.send(:"end_of_#{group_by}")]
  end
end