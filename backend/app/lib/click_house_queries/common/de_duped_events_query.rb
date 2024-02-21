module ClickHouseQueries
  module Common
    class DeDupedEventsQuery
      extend ClickHouseQueries::Helpers

      def self.sql(public_keys:, start_time:, end_time:, columns: nil, event_name: nil, all_events: false, distinct_count_property: nil)
        raise ArgumentError "Must specify the `event_name` or set `all_events` to true" if event_name.nil? && !all_events
        public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        distinct_count_property ||= 'uuid'
        columns ||= ['name', 'properties', 'user_profile_id', 'occurred_at']
        columns.reject! { |column| column == distinct_count_property }
        <<~SQL
          SELECT 
            #{['uuid', 'name'].include?(distinct_count_property) ? distinct_count_property : "JSONExtractString(e.properties, '#{distinct_count_property}')"} AS #{distinct_count_property},
            #{select_statements(columns)}
          FROM events AS e
          WHERE 
            e.swishjam_api_key IN #{formatted_in_clause(public_keys)} AND
            e.occurred_at BETWEEN '#{formatted_time(start_time)}' AND '#{formatted_time(end_time)}'
            #{all_events ? "" : " AND e.name = '#{event_name}'"}
          GROUP BY #{distinct_count_property}
        SQL
      end

      def self.select_statements(columns)
        columns.map do |column|
          if column == 'occurred_at'
            "MAX(occurred_at) AS occurred_at"
          else
            "argMax(e.#{column}, e.occurred_at) AS #{column}"
          end
        end.join(', ')
      end
    end
  end
end