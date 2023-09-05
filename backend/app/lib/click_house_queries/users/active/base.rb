module ClickHouseQueries
  module Users
    module Active
      class Base
        class << self
          attr_accessor :sql_date_trunc_unit, :filled_in_results_increment, :default_start_time, :default_end_time, :date_formatter
        end

        include ClickHouseQueries::Helpers
        include TimeseriesHelper

        def initialize(public_key, start_time: self.class.default_start_time, end_time: self.class.default_end_time || Time.current)
          @public_key = public_key
          @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: self.class.sql_date_trunc_unit)
        end

        def current_value
          timeseries.last[:value]
        end

        def timeseries
          raise ArgumentError, "#{self.class.to_s} must define `sql_date_trunc_unit` (ie: `day`, `week`, `month`)" if !self.class.sql_date_trunc_unit.present?
          return @timeseries_data if defined?(@timeseries_data)
          raw_results = Analytics::Event.find_by_sql(sql.squish!)
          @timeseries_data = filled_in_results(raw_results)
        end

        def sql
          <<~SQL
            SELECT 
              DATE_TRUNC('#{self.class.sql_date_trunc_unit}', events.occurred_at) AS group_by_date,
              DATE_TRUNC('year', events.occurred_at) AS year,
              CAST(
                COUNT(
                  DISTINCT
                    CASE
                      WHEN identify.swishjam_user_id IS NOT NULL THEN identify.swishjam_user_id
                      ELSE events.device_identifier
                    END
                )
              AS int) AS num_unique_users
            FROM events
            LEFT JOIN (
              SELECT 
                IF(device_identifier IS NULL, NULL, device_identifier) AS device_identifier,
                IF(swishjam_user_id IS NULL, NULL, swishjam_user_id) AS swishjam_user_id,
                MAX(
                  CASE
                    WHEN occurred_at IS NOT NULL
                    THEN occurred_at
                    ELSE NULL
                  END
                ) AS occurred_at
              FROM user_identify_events
              WHERE swishjam_api_key = '#{@public_key}'
              GROUP BY device_identifier, swishjam_user_id
            ) AS identify ON identify.device_identifier = events.device_identifier
            WHERE
              events.swishjam_api_key = '#{@public_key}' AND
              events.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
            GROUP BY group_by_date, year
            ORDER BY group_by_date ASC
          SQL
        end

        private

        def filled_in_results(raw_timeseries_data)
          raise ArgumentError, "#{self.class.to_s} must define `filled_in_results_increment` (ie: `1.day`, `1.week`, `1.month`)" if !self.class.filled_in_results_increment.present?
          current_date = @start_time.to_date
          formatted_results = []
          while current_date <= @end_time.to_date
            result = raw_timeseries_data.find { |result| result['group_by_date'].to_date == current_date }
            formatted_results << { 
              date: self.class.date_formatter.present? ? self.class.date_formatter.call(current_date) : current_date, 
              value: (result || {})['num_unique_users'] || 0 
            }
            current_date += self.class.filled_in_results_increment
          end
          formatted_results
        end

      end
    end
  end
end