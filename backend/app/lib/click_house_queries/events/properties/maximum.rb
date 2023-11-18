module ClickHouseQueries
  module Events
    module Properties
      class Maximum
        include ClickHouseQueries::Helpers

        def initialize(public_keys, event_name:, property_name:, start_time: 6.months.ago, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @event_name = event_name
          @property_name = property_name
          @start_time = start_time
          @end_time = end_time
        end

        def get
          Analytics::Event.find_by_sql(sql.squish!).first.maximum
        end

        private

        def sql
          <<~SQL
            SELECT 
              MAX(JSONExtractFloat(properties, '#{@property_name}')) AS maximum
            FROM events
            WHERE
              swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              name = '#{@event_name}'
          SQL
        end
      end
    end
  end
end