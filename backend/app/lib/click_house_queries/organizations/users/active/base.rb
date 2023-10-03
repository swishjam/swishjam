module ClickHouseQueries
  module Organizations
    module Users
      module Active
        class Base
          class << self
            attr_accessor :default_start_time, :default_end_time, :date_formatter
          end

          include ClickHouseQueries::Helpers
          include TimeseriesHelper

          attr_accessor :start_time, :end_time

          def initialize(public_keys, organization_profile_id:, start_time: self.class.default_start_time, end_time: self.class.default_end_time || Time.current)
            @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
            @organization_profile_id = organization_profile_id
            @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: self.class.sql_date_trunc_unit)
          end

          def timeseries
            raise ArgumentError, "#{self.class.to_s} must define valid `sql_date_trunc_unit` (ie: `day`, `week`, `month`)" if !['day', 'week', 'month'].include?(self.class.sql_date_trunc_unit)
            return @timeseries_data if defined?(@timeseries_data)
            raw_results = Analytics::Event.find_by_sql(sql.squish!)
            @timeseries_data = DataFormatters::Timeseries.new(
              raw_results, 
              start_time: start_time,
              end_time: end_time,
              group_by: self.class.sql_date_trunc_unit, 
              value_method: :num_unique_users,
              date_method: :group_by_date
            )
          end

          def sql
            <<~SQL
              SELECT
                DATE_TRUNC('#{self.class.sql_date_trunc_unit}', e.occurred_at) AS group_by_date,
                DATE_TRUNC('year', e.occurred_at) AS year,
                CAST(COUNT(DISTINCT
                  IF(
                    uie.swishjam_user_id IS NOT NULL,
                    uie.swishjam_user_id,
                    JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER}')
                  )
                ) AS int) AS num_unique_users
              FROM events AS e
              JOIN (
                SELECT DISTINCT session_identifier AS session_identifier
                FROM organization_identify_events
                WHERE
                  swishjam_organization_id = '#{@organization_profile_id}' AND
                  swishjam_api_key in #{formatted_in_clause(@public_keys)}
              ) AS oie ON oie.session_identifier = JSONExtractString(e.properties, 'session_identifier')
              LEFT JOIN (
                SELECT
                  device_identifier,
                  argMax(swishjam_user_id, occurred_at) AS swishjam_user_id
                FROM user_identify_events
                WHERE swishjam_api_key in #{formatted_in_clause(@public_keys)}
                GROUP BY device_identifier
              ) AS uie ON uie.device_identifier = JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER}')
              WHERE
                e.swishjam_api_key in #{formatted_in_clause(@public_keys)} AND
                e.occurred_at BETWEEN '#{formatted_time(start_time)}' AND '#{formatted_time(end_time)}'
              GROUP BY group_by_date, year
              ORDER BY group_by_date ASC
            SQL
          end

          def self.sql_date_trunc_unit
            date_unit = self.to_s.split('::').last.downcase
            return 'day' if date_unit == 'daily'
            date_unit.gsub('ly', '')
          end
        end
      end
    end
  end
end