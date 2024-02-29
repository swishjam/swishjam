module TimeseriesHelper
  def render_multi_dimensional_timeseries_json(timeseries, comparison_timeseries = nil)
    {
      timeseries: timeseries.formatted_data,
      comparison_timeseries: comparison_timeseries&.formatted_data,
      start_time: start_timestamp,
      end_time: end_timestamp,
      comparison_start_time: comparison_start_timestamp,
      comparison_end_time: comparison_end_timestamp,
      grouped_by: timeseries.group_by,
    }
  end

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

  def rounded_timestamps(start_ts:, end_ts:, group_by:, round_up: false)
    if ![:hour, :day, :week, :month].include?(group_by.to_sym)
      raise "Unknown group_by: #{group_by}. Expected one of: :hour, :day, :week, :month."
    end
    if round_up
      # start_time = 01/01/2024 00:00:00, end_time = 02/01/2024 00:00:00
      [start_ts.send(:"beginning_of_#{group_by}"), (end_ts + 1.send(group_by)).send(:"beginning_of_#{group_by}")]
    else
      # start_time = 01/01/2024 00:00:00, end_time = 01/31/2024 23:59:59.999999
      [start_ts.send(:"beginning_of_#{group_by}"), end_ts.send(:"end_of_#{group_by}")]
    end
  end

  def formated_groupdate_timeseries(timestamp_column: :created_at, group_by: nil, metric: :count, start_time: nil, end_time: nil, include_comparison: false)
    if !block_given?
      raise "Must provide a block of the ActiveRecord collection to perform the groupdate query."
    end
    start_time ||= start_timestamp
    end_time ||= end_timestamp
    group_by ||= derived_group_by(start_ts: start_time, end_ts: end_time)
    yield.group_by_period(group_by, timestamp_column, range: start_time..end_time).send(metric).to_a.map { |k, v| { date: k, count: v }}
    # @automation.executed_automations.group_by_hour(:started_at, range: start_timestamp..end_timestamp).send(metric).to_a.map { |k, v| { date: k, count: v } }
  end
end