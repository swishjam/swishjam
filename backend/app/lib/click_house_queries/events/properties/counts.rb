module ClickHouseQueries
  module Events
    module Properties
      class Counts
        include ClickHouseQueries::Helpers

        def initialize(public_keys, event_name:, property_name:, limit: 10, start_time: 6.months.ago, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @event_name = event_name
          @property_name = property_name
          @limit = limit
          @start_time = start_time
          @end_time = end_time
        end

        def get
          Analytics::Event.find_by_sql(sql.squish!).collect{ |record| { value: record.property, count: record.count }}
        end

        private

        def sql
          <<~SQL
            SELECT 
              JSONExtractString(properties, '#{@property_name}') AS property,
              CAST(COUNT(property) AS int) AS count
            FROM events
            WHERE
              swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              name = '#{@event_name}' AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
            GROUP BY property
            ORDER BY count DESC
            LIMIT #{@limit}
          SQL
        end
      end
    end
  end
end