module ClickHouseQueries
  module BrowserCountByAnalyticsFamilyAndHour
    class List
      extend ClickHouseQueries::Helpers

      def self.sql(api_key:, analytics_family:, start_time:, end_time: Time.current, limit: 10)
        statement = <<~SQL
          SELECT SUM(count) AS count, browser_name
          FROM #{Analytics::BrowserCountByAnalyticsFamilyAndHour.table_name}
          WHERE
            swishjam_api_key = '#{api_key}' AND
            occurred_at >= '#{formatted_time(start_time)}' AND
            occurred_at <= '#{formatted_time(end_time)}' AND
            analytics_family = '#{analytics_family}'
          GROUP BY browser_name
          ORDER BY count DESC
          LIMIT #{limit}
        SQL
        statement.squish!
      end
    end
  end
end