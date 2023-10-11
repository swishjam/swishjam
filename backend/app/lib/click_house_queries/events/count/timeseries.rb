module ClickHouseQueries
  module Events
    module Count
      class Timeseries
        include ClickHouseQueries::Helpers
        include TimeseriesHelper

        def initialize(public_keys, event_name:, start_time:, end_time:)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @event_name = event_name
          @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
          @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        end

        def get
          raw_results = Analytics::Event.find_by_sql(sql.squish!)
          DataFormatters::Timeseries.new(
            raw_results, 
            start_time: @start_time, 
            end_time: @end_time, 
            group_by: @group_by,
            value_method: :count,
            date_method: :group_by_date
          )
        end

        def sql
          <<~SQL
            SELECT
              CAST(COUNT(*) AS int) AS count,
              DATE_TRUNC('#{@group_by}', occurred_at) AS group_by_date
            FROM events
            WHERE
              swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              name = '#{@event_name}'
            GROUP BY group_by_date
            ORDER BY group_by_date
          SQL
        end
      end
    end
  end
end