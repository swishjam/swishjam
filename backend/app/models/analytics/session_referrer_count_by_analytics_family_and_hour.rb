module Analytics
  class SessionReferrerCountByAnalyticsFamilyAndHour < ClickHouseRecord
    self.table_name = :session_referrer_counts_by_analytics_family_and_hour

    def self.list(api_key:, analytics_family:, start_time:, end_time: Time.current, limit: 10)
      query = ClickHouseQueries::SessionReferrerCountByAnalyticsFamilyAndHour::List.sql(
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