module ClickHouseQueries
  module Common
    class DeDupedEventsQuery
      extend ClickHouseQueries::Helpers

      def self.sql(public_keys:, start_time:, end_time:, columns: nil, event_name: nil, all_events: false, group_by_column: nil)
        raise ArgumentError "Must specify the `event_name` or set `all_events` to true" if event_name.nil? && !all_events
        public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        group_by_column ||= 'uuid'
        columns ||= ['name', 'properties', 'user_profile_id', 'occurred_at']
        columns.reject! { |column| column == group_by_column }
        <<~SQL
          SELECT #{select_statements(columns, group_by_column)}
          FROM events AS e
          WHERE 
            e.swishjam_api_key IN #{formatted_in_clause(public_keys)} AND
            e.occurred_at BETWEEN '#{formatted_time(start_time)}' AND '#{formatted_time(end_time)}'
            #{all_events ? "" : " AND e.name = '#{event_name}'"}
          GROUP BY #{group_by_column.gsub('.', '_')}
        SQL
      end

      def self.select_statements(columns, group_by_column)
        selects = []
        if group_by_column == 'uuid'
          selects << "e.uuid AS uuid"
        elsif group_by_column.starts_with?('user.')
          selects << "JSONExtractString(e.user_properties, '#{group_by_column.gsub('user.', '')}') AS #{group_by_column.gsub('.', '_')}"
        else
          selects << "JSONExtractString(e.properties, '#{group_by_column}') AS #{group_by_column.gsub('.', '_')}"
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