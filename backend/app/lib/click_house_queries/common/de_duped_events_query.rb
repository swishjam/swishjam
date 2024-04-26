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
          SELECT #{select_statements(columns, distinct_count_property)}
          FROM events AS e
          WHERE 
            e.swishjam_api_key IN #{formatted_in_clause(public_keys)} AND
            e.occurred_at BETWEEN '#{formatted_time(start_time)}' AND '#{formatted_time(end_time)}'
            #{all_events ? "" : " AND e.name = '#{event_name}'"}
          GROUP BY #{distinct_count_property.gsub('.', '_')}
        SQL
      end

      def self.select_statements(columns, distinct_count_property)
        selects = []
        if distinct_count_property == 'uuid'
          selects << "e.uuid AS uuid"
        elsif distinct_count_property.starts_with?('user.')
          selects << "JSONExtractString(e.user_properties, '#{distinct_count_property.gsub('user.', '')}') AS #{distinct_count_property.gsub('.', '_')}"
        else
          selects << "JSONExtractString(e.properties, '#{distinct_count_property}') AS #{distinct_count_property.gsub('.', '_')}"
        end
        columns.each do |column|
          if column == 'occurred_at'
            selects << "MAX(occurred_at) AS occurred_at"
          else
            selects << "argMax(e.#{column}, e.occurred_at) AS #{column}"
          end
        end
        selects.join(", ")
      end
    end
  end
end