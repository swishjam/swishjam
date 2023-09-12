module Analytics
  class SessionCountByAnalyticsFamilyAndHour < ClickHouseRecord
    extend TimeseriesHelper
    self.table_name = :session_counts_by_analytics_family_and_hour

    def self.timeseries(api_key:, analytics_family:, start_time:, end_time: Time.current)
      group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
      start_time, end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: group_by)
      query = ClickHouseQueries::SessionCountByStartingUrlAndHour::Timeseries.sql(
        api_key: api_key, 
        analytics_family: analytics_family, 
        start_time: start_time, 
        end_time: end_time,
        group_by: group_by
      )
      DataFormatters::Timeseries.new(find_by_sql(query), start_time: start_time, end_time: end_time, group_by: group_by)
    end
  end
end