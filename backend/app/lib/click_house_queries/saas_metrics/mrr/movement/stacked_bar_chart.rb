module ClickHouseQueries
  module SaasMetrics
    module Mrr
      module Movement
        class StackedBarChart
          include ClickHouseQueries::Helpers
          include TimeseriesHelper

          def initialize(public_keys, start_time: 30.days.ago, end_time: Time.current)
            @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
            @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
            @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
          end

          def get
            raw_data = Analytics::ClickHouseRecord.execute_sql(sql.squish!)

            current_time = @start_time
            filled_in_data = []
            while current_time <= @end_time
              results_for_date = raw_data.find_all{ |result| result['grouped_by_date'].to_datetime == current_time.to_datetime }

              hash_for_date = Hash.new.tap do |hash|
                hash[:date] = current_time
                hash[:new] = (results_for_date.find{ |result| result['movement_type'] == 'new' } || {})['movement_amount'] || 0
                hash[:expansion] = (results_for_date.find{ |result| result['movement_type'] == 'expansion' } || {})['movement_amount'] || 0
                hash[:contraction] = (results_for_date.find{ |result| result['movement_type'] == 'contraction' } || {})['movement_amount'] || 0
                hash[:churn] = (results_for_date.find{ |result| result['movement_type'] == 'churn' } || {})['movement_amount'] || 0
                hash[:reactivation] = (results_for_date.find{ |result| result['movement_type'] == 'reactivation' } || {})['movement_amount'] || 0
              end

              filled_in_data << hash_for_date
              current_time += 1.send(@group_by)
            end
            filled_in_data
          end

          def sql
            <<~SQL
              SELECT 
                SUM(JSONExtractFloat(properties, 'movement_amount')) AS movement_amount,
                JSONExtractString(properties, 'movement_type') AS movement_type,
                DATE_TRUNC('#{@group_by}', occurred_at) AS grouped_by_date
              FROM events
              WHERE
                swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
                name = '#{Analytics::Event::ReservedNames.MRR_MOVEMENT}' AND
                occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
              GROUP BY grouped_by_date, movement_type
              ORDER BY grouped_by_date
            SQL
          end
        end
      end
    end
  end
end