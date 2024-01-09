module ClickHouseQueries
  module PageViews
    class Count 
      include ClickHouseQueries::Helpers

      def initialize(public_keys, start_time:, end_time: Time.current)
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @start_time = start_time 
        @end_time = end_time 
      end

      def count 
        Analytics::ClickHouseRecord.execute_sql(sql.squish!).first['count']
      end

      def sql
        <<~SQL
          SELECT
            CAST(COUNT(DISTINCT JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.PAGE_VIEW_IDENTIFIER}')) AS int) AS count
          FROM events
          WHERE
            swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
            name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}'
        SQL
      end
    end
  end
end