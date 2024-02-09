module ClickHouseQueries
  module Events
    module Sum
      class Timeseries
        include ClickHouseQueries::Helpers
        include TimeseriesHelper

        def initialize(public_keys, event_name:, property:, start_time:, end_time:, group_by: nil)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @event_name = event_name
          @property = property
          @group_by = group_by || derived_group_by(start_ts: start_time, end_ts: end_time)
          @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        end

        def get
          raw_results = Analytics::Event.find_by_sql(sql.squish!)
          DataFormatters::Timeseries.new(
            raw_results, 
            start_time: @start_time, 
            end_time: @end_time, 
            group_by: @group_by,
            value_method: :sum,
            date_method: :group_by_date
          )
        end

        def sql
          <<~SQL
            SELECT
              SUM(JSONExtractFloat(properties, '#{@property}')) AS sum,
              DATE_TRUNC('#{@group_by}', occurred_at) AS group_by_date
            FROM (
              SELECT 
                uuid, 
                argMax(properties, ingested_at) AS properties,
                argMax(occurred_at, ingested_at) AS occurred_at
              FROM events
              WHERE
                swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
                events.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
                name = '#{@event_name}'
              GROUP BY uuid
            )
            GROUP BY group_by_date
            ORDER BY group_by_date ASC
          SQL
        end
      end
    end
  end
end