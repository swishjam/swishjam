module ClickHouseQueries
  module Users
    module Active
      class Base
        class << self
          attr_accessor :sql_date_trunc_unit, :filled_in_results_increment, :default_start_time, :default_end_time, :date_formatter
        end

        include ClickHouseQueries::Helpers
        include TimeseriesHelper

        def initialize(public_key, analytics_family: 'product', start_time: self.class.default_start_time, end_time: self.class.default_end_time || Time.current)
          @public_key = public_key
          @analytics_family = analytics_family
          @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: self.class.sql_date_trunc_unit)
        end

        def timeseries
          raise ArgumentError, "#{self.class.to_s} must define `sql_date_trunc_unit` (ie: `day`, `week`, `month`)" if !self.class.sql_date_trunc_unit.present?
          return @timeseries_data if defined?(@timeseries_data)
          raw_results = Analytics::Event.find_by_sql(sql.squish!)
          @timeseries_data = DataFormatters::Timeseries.new(
            raw_results, 
            start_time: @start_time,
            end_time: @end_time,
            group_by: self.class.sql_date_trunc_unit, 
            value_method: :num_unique_users,
            date_method: :group_by_date
          )
        end

        def sql
          <<~SQL
            SELECT 
              DATE_TRUNC('#{self.class.sql_date_trunc_unit}', events.occurred_at) AS group_by_date,
              DATE_TRUNC('year', events.occurred_at) AS year,
              CAST(COUNT(DISTINCT
                IF(
                  identify.swishjam_user_id IS NOT NULL, 
                  identify.swishjam_user_id, 
                  JSONExtractString(events.properties, '#{Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER}')
                )
              ) AS int) AS num_unique_users
            FROM events
            LEFT JOIN (
              SELECT
                device_identifier,
                MAX(occurred_at) AS max_occurred_at,
                argMax(swishjam_user_id, occurred_at) AS swishjam_user_id
              FROM user_identify_events AS uie
              WHERE swishjam_api_key = '#{@public_key}'
              GROUP BY device_identifier
            ) AS identify ON identify.device_identifier = JSONExtractString(events.properties, '#{Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER}')
            WHERE
              events.swishjam_api_key = '#{@public_key}' AND
              events.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              events.analytics_family = '#{@analytics_family}'
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