module ClickHouseQueries
  module Common
    class StackedBarChartByEventProperty
      include ClickHouseQueries::Helpers
      include TimeseriesHelper

      def initialize(public_keys, event_name:, property:, start_time: 6.months.ago, end_time: Time.current)
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @event_name = event_name
        @property = property
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
          key_method: @property,
          value_method: :count, 
          date_method: :group_by_date,
        )
      end

      def sql
        <<~SQL
          SELECT
            JSONExtractString(properties, '#{@property}') AS #{@property},
            DATE_TRUNC('#{@group_by}', occurred_at) AS group_by_date,
            CAST(COUNT() AS INT) AS count
          FROM events
          WHERE
            swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
            name = '#{@event_name}'
          GROUP BY group_by_date, #{@property}
          ORDER BY group_by_date, count DESC
        SQL
      end
    end
  end
end