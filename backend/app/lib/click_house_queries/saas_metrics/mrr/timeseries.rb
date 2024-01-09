module ClickHouseQueries
  module SaasMetrics
    module Mrr
      class Timeseries
        include ClickHouseQueries::Helpers
        include TimeseriesHelper

        attr_reader :start_time, :end_time, :group_by

        def initialize(public_keys, start_time: 30.days.ago, end_time: Time.current, buffer_amount_for_filled_in_results: 10)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
          @buffer_amount_for_filled_in_results = buffer_amount_for_filled_in_results
          @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        end

        def get
          raw_results = Analytics::ClickHouseRecord.execute_sql(sql.squish!)
          
          current_date = @start_time
          filled_in_results = []
          most_recent_result = nil
          while current_date <= @end_time
            result_for_date = find_closest_result_for_missing_date(raw_results, current_date)
            if result_for_date.present?
              filled_in_results << { 'group_by_date' => current_date, 'mrr' => result_for_date['mrr'] }
              most_recent_result = result_for_date
            else
              filled_in_results << { 'group_by_date' => current_date, 'mrr' => (most_recent_result || {})['mrr'] || 0 } 
            end
            current_date += 1.send(@group_by.to_sym)
          end
          filled_in_results
        end

        def sql
          <<~SQL
            SELECT 
              grouped_data.group_by_date AS group_by_date,
              SUM(grouped_data.mrr) OVER (ORDER BY grouped_data.group_by_date) AS mrr
            FROM (
              SELECT 
                DATE_TRUNC('#{@group_by}', occurred_at) AS group_by_date, 
                SUM(JSONExtractFloat(properties, 'movement_amount')) AS mrr
              FROM events
              WHERE
                swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
                name = '#{Analytics::Event::ReservedNames.MRR_MOVEMENT}' AND
                occurred_at BETWEEN '#{formatted_time(@start_time - @buffer_amount_for_filled_in_results.send(@group_by))}' AND '#{formatted_time(@end_time)}'
              GROUP BY group_by_date
            ) AS grouped_data
            ORDER BY group_by_date
          SQL
        end

        def find_closest_result_for_missing_date(results, date)
          results.select{ |result| result['group_by_date'].to_datetime <= date.to_datetime }.last
        end
      end
    end
  end
end