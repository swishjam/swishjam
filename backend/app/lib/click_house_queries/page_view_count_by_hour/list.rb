module ClickHouseQueries
  module PageViewCountByHour
    class List
      extend ClickHouseQueries::Helpers

      def self.sql(api_key:, start_time:, end_time:, analytics_family:, limit: 10)
        statement = <<~SQL
          SELECT SUM(count) AS count, CONCAT(url_host, url_path) AS url
          FROM #{Analytics::PageViewCountByHour.table_name}
          WHERE
            swishjam_api_key = '#{api_key}' AND
            occurred_at >= '#{formatted_time(start_time)}' AND
            occurred_at <= '#{formatted_time(end_time)}' AND
            analytics_family = '#{analytics_family}'
          GROUP BY url
          ORDER BY count DESC
          LIMIT #{limit}
        SQL
        statement.squish!
      end
    end
  end
end