module ClickHouseQueries
  module Sessions
    module UrlParameters
      class StackedBarChart
        include ClickHouseQueries::Helpers
        include TimeseriesHelper

        def initialize(public_keys, query_param:, max_ranking_to_not_be_considered_other: 10, start_time: 6.months.ago, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @query_param = query_param
          @max_ranking_to_not_be_considered_other = max_ranking_to_not_be_considered_other
          @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
          @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        end

        def get
          data = Analytics::Event.find_by_sql(sql.squish!)
          DataFormatters::StackedBarChart.new(
            data, 
            start_time: @start_time, 
            end_time: @end_time, 
            group_by: @group_by, 
            key_method: :query_param,
            value_method: :count, 
            date_method: :group_by_date,
          )
        end

        def sql
          <<~SQL
            WITH ranked_properties AS (
              SELECT
                extractURLParameter(
                  JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.URL}'), 
                  '#{@query_param}'
                ) AS query_param,
                COUNT() as total_count,
                RANK() OVER (
                  ORDER BY COUNT() DESC, 
                  extractURLParameter(JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.URL}'), '#{@query_param}')
                ) as rank
              FROM events
              WHERE
                swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
                occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
                name = '#{Analytics::Event::ReservedNames.NEW_SESSION}' AND
                query_param IS NOT NULL AND 
                query_param != ''
              GROUP BY query_param
            )
            SELECT
              CASE
                WHEN rr.rank <= #{@max_ranking_to_not_be_considered_other} 
                THEN extractURLParameter(JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.URL}'), '#{@query_param}')
                ELSE 'Other'
              END AS query_param,
              DATE_TRUNC('#{@group_by}', e.occurred_at) AS group_by_date,
              CAST(COUNT() AS INT) AS count
            FROM events e
            JOIN ranked_properties rr ON extractURLParameter(JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.URL}'), '#{@query_param}') = rr.query_param
            WHERE
              e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              e.name = '#{Analytics::Event::ReservedNames.NEW_SESSION}'
            GROUP BY group_by_date, query_param
            ORDER BY group_by_date, count
          SQL
        end
      end
    end
  end
end