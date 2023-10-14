module ClickHouseQueries
  module Events
    module Properties
      class Unique
        include ClickHouseQueries::Helpers

        def initialize(public_keys, event_name:, limit: 1_000, start_time: 6.months.ago, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @event_name = event_name
          @limit = limit
          @start_time = start_time
          @end_time = end_time
        end

        def get
          Analytics::Event.find_by_sql(sql.squish!).collect(&:property_name)
        end

        private

        def sql
          <<~SQL
            SELECT DISTINCT property_name
            FROM events
            ARRAY JOIN JSONExtractKeys(properties) AS property_name
            WHERE
              swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              name = '#{@event_name}' AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
            LIMIT #{@limit}
          SQL
        end
      end
    end
  end
end