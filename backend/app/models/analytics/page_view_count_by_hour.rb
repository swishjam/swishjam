module Analytics
  class PageViewCountByHour < ClickHouseRecord
    # extend TimeseriesHelper
    self.table_name = :page_view_counts_by_hour

    def self.list(api_key:, analytics_family:, start_time:, end_time: Time.current, limit: 10)
      query = ClickHouseQueries::PageViewCountByHour::List.sql(
        api_key: api_key, 
        analytics_family: analytics_family, 
        start_time: start_time, 
        end_time: end_time,
        limit: limit
      )
      find_by_sql(query)
    end
  end
end