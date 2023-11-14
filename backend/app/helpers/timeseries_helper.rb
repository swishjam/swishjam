module TimeseriesHelper
  def render_timeseries_json(timeseries, comparison_timeseries = nil)
    {
      timeseries: timeseries.formatted_data,
      current_count: timeseries.current_value,
      total_count: timeseries.summed_value,
      comparison_timeseries: comparison_timeseries&.formatted_data,
      comparison_count: comparison_timeseries&.current_value,
      comparison_total_count: comparison_timeseries&.summed_value,
      start_time: start_timestamp,
      end_time: end_timestamp,
      comparison_start_time: comparison_start_timestamp,
      comparison_end_time: comparison_end_timestamp,
      grouped_by: timeseries.group_by,
    }
  end

  def derived_group_by(start_ts:, end_ts:)
    case end_ts - start_ts
    when 0..(8.days - 1.second)
      :hour
    when 8.days..(1.month + 1.day)
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