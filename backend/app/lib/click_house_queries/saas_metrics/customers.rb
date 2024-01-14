module ClickHouseQueries
  module SaasMetrics
    class Customers
      include ClickHouseQueries::Helpers
      include TimeseriesHelper

      def initialize(public_keys, start_time:, end_time:)
        @public_keys = public_keys
        @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
        @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
      end

      def timeseries
        @timeseries ||= begin
          data = Analytics::ClickHouseRecord.execute_sql(sql.squish!)
          DataFormatters::Timeseries.new(
            data,
            start_time: @start_time,
            end_time: @end_time,
            group_by: @group_by,
            value_method: :num_unique_users,
            date_method: :group_by_date
          )
        end
      end

      def sql
        <<~SQL
          SELECT 
            CAST(COUNT(DISTINCT uuid) AS INT) AS num_unique_users,
            DATE_TRUNC('#{@group_by}', occurred_at) AS group_by_date
          FROM events
          WHERE
            swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
            name = '#{StripeHelpers::SupplementalEvents::NewSubscriber.EVENT_NAME}'
          GROUP BY group_by_date
          ORDER BY group_by_date ASC
        SQL
      end
    end
  end
end