module ClickHouseQueries
  module Sessions
    module DeviceTypes
      class StackedBarChart
        include ClickHouseQueries::Helpers
        include TimeseriesHelper

        def initialize(public_keys, start_time: 6.months.ago, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
          @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        end

        def data
          return @filled_in_results if defined?(@filled_in_results)
          data = Analytics::Event.find_by_sql(sql.squish!)
          DataFormatters::StackedBarChart.new(
            data, 
            start_time: @start_time, 
            end_time: @end_time, 
            group_by: @group_by, 
            key_method: :device_type,
            value_method: :count, 
            date_method: :group_by_date,
          )
        end

        def sql
          <<~SQL
            SELECT
              CASE WHEN JSONExtractString(properties, 'is_mobile') = 'true' THEN 'mobile' ELSE 'desktop' END AS device_type,
              DATE_TRUNC('#{@group_by}', occurred_at) AS group_by_date,
              CAST(COUNT() AS INT) AS count
            FROM events
            WHERE
              swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              name = '#{Analytics::Event::ReservedNames.NEW_SESSION}'
            GROUP BY group_by_date, device_type
            ORDER BY group_by_date, count DESC
          SQL
        end
      end
    end
  end
end