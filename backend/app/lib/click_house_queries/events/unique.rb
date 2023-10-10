module ClickHouseQueries
  module Events
    class Unique
      include ClickHouseQueries::Helpers

      def initialize(public_keys, limit: 20, start_time: 6.months.ago, end_time: Time.current)
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @limit = limit
        @start_time = start_time
        @end_time = end_time
      end

      def get
        @events ||= Analytics::Event.find_by_sql(sql.squish!)
      end

      def sql
        <<~SQL
          SELECT 
            DISTINCT name,
            COUNT(name) AS count
          FROM events
          WHERE
            swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
          GROUP BY name
          ORDER BY count DESC
          LIMIT #{@limit}
        SQL
      end
    end
  end
end