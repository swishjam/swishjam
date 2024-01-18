module ClickHouseQueries
  module Events
    class List
      include ClickHouseQueries::Helpers

      def initialize(public_keys, start_time: 30.days.ago, end_time: Time.current, event_name: nil, event_names: nil)
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @start_time = start_time
        @end_time = end_time
        raise ArgumentError, "Must provide either `event_name` or `event_names`" if event_name.nil? && event_names.nil?
        @event_names = event_names || [event_name]
      end

      def get
        @data ||= Analytics::ClickHouseRecord.execute_sql(sql.squish!)
      end

      def sql
        <<~SQL
          SELECT 
            uuid,
            MAX(occurred_at) AS occurred_at,
            argMax(name, e.occurred_at) AS name, 
            argMax(properties, e.occurred_at) AS properties
          FROM events AS e
          WHERE 
            e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
            e.name IN #{formatted_in_clause(@event_names)}
          GROUP BY uuid
        SQL
      end
    end
  end
end