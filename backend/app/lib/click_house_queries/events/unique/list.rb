module ClickHouseQueries
  module Events
    module Unique
      class List
        include ClickHouseQueries::Helpers

        def initialize(public_key, limit: 50, start_time: 6.months.ago, end_time: Time.current)
          @public_key = public_key
          @limit = limit
          @start_time = start_time
          @end_time = end_time
        end

        def get
          Analytics::Event.find_by_sql(sql.squish!).collect{ |event| { name: event.name, count: event.count }}
        end

        private

        def sql
          <<~SQL
            SELECT name, count() AS count
            FROM events
            WHERE
              swishjam_api_key = '#{@public_key}' AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
            GROUP BY name
            ORDER BY count DESC
            LIMIT #{@limit}
          SQL
        end
      end
    end
  end
end