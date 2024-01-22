module ClickHouseQueries
  module Events
    class StackedBarChart
      include ClickHouseQueries::Helpers
      include TimeseriesHelper

      def initialize(
        public_keys, 
        event:, 
        property:, 
        start_time:, 
        end_time:, 
        group_by: nil, 
        select_function_formatter: nil, 
        select_function_argument: nil,
        count_distinct_property: nil,
        property_alias: nil, 
        max_ranking_to_not_be_considered_other: 10,
        exclude_empty_property_values: true
      )
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @event = event
        @property = property
        @group_by = group_by || derived_group_by(start_ts: start_time, end_ts: end_time)
        @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        @select_function_formatter = select_function_formatter
        @select_function_argument = select_function_argument
        @property_alias = property_alias || property
        @count_distinct_property = count_distinct_property
        @max_ranking_to_not_be_considered_other = max_ranking_to_not_be_considered_other
        @exclude_empty_property_values = exclude_empty_property_values
      end

      def get
        return @filled_in_results if defined?(@filled_in_results)
        data = Analytics::Event.find_by_sql(sql.squish!)
        DataFormatters::StackedBarChart.new(
          data, 
          start_time: @start_time, 
          end_time: @end_time, 
          group_by: @group_by, 
          key_method: @property_alias,
          value_method: :count, 
          date_method: :group_by_date,
        )
      end

      def sql
        <<~SQL
          WITH ranked_properties AS (
            SELECT
              #{select_clause_property_portion} AS #{@property_alias},
              CAST(COUNT(DISTINCT #{count_distinct_clause}) AS INT) as total_count,
              RANK() OVER (ORDER BY COUNT() DESC) as rank
            FROM events AS e
            WHERE
              swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              name = '#{@event}'
            GROUP BY #{@property_alias}
          )
          SELECT
            CASE
              WHEN rr.rank <= #{@max_ranking_to_not_be_considered_other} THEN #{select_clause_property_portion}
              ELSE 'Other'
            END AS #{@property_alias},
            DATE_TRUNC('#{@group_by}', e.occurred_at) AS group_by_date,
            CAST(COUNT(DISTINCT #{count_distinct_clause}) AS INT) AS count
          FROM events AS e
          JOIN ranked_properties AS rr ON #{select_clause_property_portion} = rr.#{@property_alias}
          WHERE
            e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
            e.name = '#{@event}'
            #{@exclude_empty_property_values ?  " AND notEmpty(#{@property_alias})" : ''}
          GROUP BY group_by_date, #{@property_alias}
          ORDER BY group_by_date, count
        SQL
      end

      def count_distinct_clause
        @count_distinct_property ? "JSONExtractString(e.properties, '#{@count_distinct_property}')" : 'e.uuid'
      end

      def select_clause_property_portion
        # ie: extractURLParameter(JSONExtractString(e.properties, 'url'), 'utm_source')
        select = ""
        select += "#{@select_function_formatter}(" if @select_function_formatter
        select += "JSONExtractString(e.properties, '#{@property}')"
        select += ", '#{@select_function_argument}'" if @select_function_argument && @select_function_formatter
        select += ")" if @select_function_formatter
        select
      end
    end
  end
end