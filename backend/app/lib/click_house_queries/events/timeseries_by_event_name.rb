module ClickHouseQueries
  module Events
    class TimeseriesByEventName
      include ClickHouseQueries::Helpers
      include TimeseriesHelper

      def initialize(public_keys, event_name:, start_time:, end_time: Time.current)
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @event_name = event_name
        @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
        @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        @normalized_event_name = event_name.gsub('.', '_')
      end

      def get
        @timeseries ||= begin
          data = Analytics::ClickHouseRecord.execute_sql(sql.squish!)
          DataFormatters::Timeseries.new(
            data,
            start_time: @start_time,
            end_time: @end_time,
            group_by: @group_by,
            value_method: @normalized_event_name.to_sym,
            date_method: :group_by_date
          )
        end
      end

      def sql
        <<~SQL
          SELECT 
            CAST(COUNT(DISTINCT uuid) AS INT) AS #{@normalized_event_name},
            DATE_TRUNC('#{@group_by}', occurred_at) AS group_by_date
          FROM events
          WHERE
            swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
            name = '#{@event_name}'
          GROUP BY group_by_date
          ORDER BY group_by_date ASC
        SQL
      end
    end
  end
end