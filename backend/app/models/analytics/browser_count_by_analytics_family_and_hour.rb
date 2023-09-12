module Analytics
  class BrowserCountByAnalyticsFamilyAndHour < ClickHouseRecord
    self.table_name = :browser_counts_by_analytics_family_and_hour

    def self.list(api_key:, analytics_family:, start_time:, end_time: Time.current, limit: 10)
      query = ClickHouseQueries::BrowserCountByAnalyticsFamilyAndHour::List.sql(
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