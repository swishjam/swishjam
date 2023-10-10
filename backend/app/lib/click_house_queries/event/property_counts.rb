module ClickHouseQueries
  module Event
    class PropertyCounts
      include ClickHouseQueries::Helpers

      def initialize(public_keys, event_name:, limit: 10, start_time: 6.months.ago, end_time: Time.current, ignore_reserved_properties: true)
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @event_name = event_name
        @limit = limit
        @start_time = start_time
        @end_time = end_time
        @ignore_reserved_properties = true
      end

      def get
        return @data if @data.present?
        raw_data = Analytics::Event.find_by_sql(sql.squish!)
        @data = raw_data.collect{ |e| { attribute: e.key, count: e.count }}
      end

      def sql
        filtered_property_names_where_clause = <<~SQL
          WHERE key NOT IN #{formatted_in_clause(Analytics::Event::ReservedPropertyNames.all)}
        SQL
        <<~SQL
          SELECT key, CAST(count() AS INT) AS count
          FROM (
            SELECT arrayJoin(JSONExtractKeys(properties)) AS key
            FROM events
            WHERE
              swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              name = '#{@event_name}'
          )
          #{@ignore_reserved_properties ? "#{filtered_property_names_where_clause}" : nil}
          GROUP BY key
          ORDER BY count DESC
          LIMIT #{@limit}
        SQL
      end
    end
  end
end