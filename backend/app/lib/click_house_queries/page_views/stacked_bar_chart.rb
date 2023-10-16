module ClickHouseQueries
  module PageViews
    class StackedBarChart
      include ClickHouseQueries::Helpers
      include TimeseriesHelper

      def initialize(public_keys, max_ranking_to_not_be_considered_other: 10, start_time: 30.days.ago, end_time: Time.current)
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
        @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        @max_ranking_to_not_be_considered_other = max_ranking_to_not_be_considered_other
      end

      def data
        return @filled_in_results if defined?(@filled_in_results)
        data = Analytics::Event.find_by_sql(sql.squish!)
        DataFormatters::StackedBarChart.new(
          data, 
          start_time: @start_time, 
          end_time: @end_time, 
          group_by: @group_by, 
          key_method: :url_path,
          value_method: :count, 
          date_method: :group_by_date,
        )
      end

      def sql
        <<~SQL
          WITH ranked_properties AS (
            SELECT
              path(
                JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.URL}')
              ) AS url_path,
              COUNT() as total_count,
              RANK() OVER (ORDER BY COUNT() DESC) as rank
            FROM events
            WHERE
              swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}'
            GROUP BY url_path
          )
          SELECT
            CASE
              WHEN rr.rank <= #{@max_ranking_to_not_be_considered_other} THEN path(JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.URL}'))
              ELSE 'Other'
            END AS url_path,
            DATE_TRUNC('#{@group_by}', e.occurred_at) AS group_by_date,
            CAST(COUNT() AS INT) AS count
          FROM events e
          JOIN ranked_properties rr ON path(JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.URL}')) = rr.url_path
          WHERE
            e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
            e.name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}'
          GROUP BY group_by_date, url_path
          ORDER BY group_by_date, count
        SQL
      end
    end
  end
end