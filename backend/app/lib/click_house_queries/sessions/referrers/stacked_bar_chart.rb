module ClickHouseQueries
  module Sessions
    module Referrers
      class StackedBarChart
        include ClickHouseQueries::Helpers
        include TimeseriesHelper

        def initialize(public_keys, start_time: 6.months.ago, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
          @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        end

        def data
          @data ||= ClickHouseQueries::Common::StackedBarChartByEventProperty.new(
            @public_keys,
            event_name: Analytics::Event::ReservedNames.NEW_SESSION,
            property: Analytics::Event::ReservedPropertyNames.REFERRER,
            start_time: @start_time,
            end_time: @end_time,
          ).data
        end

        # def sql_for_other_grouping
        #   <<~SQL
        #     WITH ranked_referrers AS (
        #       SELECT
        #         JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.REFERRER}') AS referrer,
        #         COUNT() as total_count,
        #         RANK() OVER (ORDER BY COUNT() DESC) as rank
        #       FROM events
        #       WHERE
        #         swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
        #         occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
        #         name = '#{Analytics::Event::ReservedNames.NEW_SESSION}'
        #       GROUP BY referrer
        #     )
        #     SELECT
        #       CASE
        #         WHEN rr.rank <= 10 THEN JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.REFERRER}')
        #         ELSE 'other'
        #       END AS referrer,
        #       DATE_TRUNC('#{@group_by}', e.occurred_at) AS group_by_date,
        #       COUNT() as count
        #     FROM events e
        #     JOIN ranked_referrers rr ON JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.REFERRER}') = rr.referrer
        #     WHERE
        #       e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
        #       e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
        #       e.name = '#{Analytics::Event::ReservedNames.NEW_SESSION}'
        #     GROUP BY group_by_date, referrer
        #     ORDER BY group_by_date, count
        #   SQL
        # end
      end
    end
  end
end