module ClickHouseQueries
  module Sessions
    class Timeseries
      include ClickHouseQueries::Helpers
      include TimeseriesHelper

      def initialize(public_key, analytics_family:, start_time: 6.months.ago, end_time: Time.current)
        @public_key = public_key
        @analytics_family = analytics_family
        @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
        @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
      end

      def timeseries
        return @filled_in_results if defined?(@filled_in_results)
        data = Analytics::Event.find_by_sql(sql.squish!)
        DataFormatters::Timeseries.new(
          data, 
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
            CAST(COUNT(DISTINCT JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER}')) AS int) AS count,
            DATE_TRUNC('#{@group_by}', occurred_at) AS group_by_date
          FROM events
          WHERE
            swishjam_api_key = '#{@public_key}' AND
            occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
            name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}' AND
            analytics_family = '#{@analytics_family}'
          GROUP BY group_by_date
          ORDER BY group_by_date
        SQL
      end
    end
  end
end