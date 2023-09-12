module ClickHouseQueries
  module SessionCountByStartingUrlAndHour
    class Timeseries
      extend ClickHouseQueries::Helpers

      def self.sql(api_key:, start_time:, end_time:, analytics_family:, group_by:)
        statement = <<~SQL
          WITH session_counts_by_hour_for_params AS (
            SELECT occurred_at, SUM(count) AS count
            FROM #{Analytics::SessionCountByAnalyticsFamilyAndHour.table_name}
            WHERE
              swishjam_api_key = '#{api_key}' AND
              occurred_at >= '#{formatted_time(start_time)}' AND
              occurred_at <= '#{formatted_time(end_time)}' AND
              analytics_family = '#{analytics_family}'
            GROUP BY occurred_at
          )
          SELECT
            DATE_TRUNC('#{group_by}', occurred_at) AS occurred_at,
            SUM(count) AS count
          FROM session_counts_by_hour_for_params
          GROUP BY occurred_at
          ORDER BY occurred_at
        SQL
        statement.squish!
      end
    end
  end
end