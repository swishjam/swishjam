module ClickHouseQueries
  module Events
    class Search
      include ClickHouseQueries::Helpers

      def initialize(public_keys, query:, limit: 10, start_time: 6.months.ago, end_time: Time.current)
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @query = query.downcase
        @limit = limit
        @start_time = start_time
        @end_time = end_time
      end

      def query
        @data ||= Analytics::Event.find_by_sql(sql.squish!).collect{ |e| { name: e.name, count: e.count }}
      end

      def sql
        <<~SQL
          SELECT name, count() AS count
          FROM events
          WHERE
            swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
            LOWER(name) LIKE '%#{@query}%'
          GROUP BY name
          ORDER BY count
          LIMIT #{@limit}
        SQL
      end
    end
  end
end