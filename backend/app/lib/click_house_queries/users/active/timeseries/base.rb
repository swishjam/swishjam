module ClickHouseQueries
  module Users
    module Active
      module Timeseries
        class Base
          class << self
            attr_accessor :sql_date_trunc_unit, :filled_in_results_increment, :default_start_time, :default_end_time, :date_formatter
          end

          include ClickHouseQueries::Helpers
          include TimeseriesHelper

          def initialize(public_keys, workspace_id:, use_active_users_segment: true, start_time: self.class.default_start_time, end_time: self.class.default_end_time || Time.current)
            @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
            @workspace_id = workspace_id
            @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: self.class.sql_date_trunc_unit)
            if use_active_users_segment
              workspace = Workspace.find(workspace_id)
              @active_users_segment = workspace.user_segments.ACTIVE_USERS_SEGMENT
            end
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
            # isNull(user_profiles.merged_into_swishjam_user_id),
            # IF(
            #   isNull(events.user_profile_id),
            #   JSONExtractString(events.properties, 'device_identifier'),
            #   events.user_profile_id
            # ),
            # user_profiles.merged_into_swishjam_user_id
            <<~SQL
              SELECT 
                DATE_TRUNC('#{self.class.sql_date_trunc_unit}', events.occurred_at) AS group_by_date,
                DATE_TRUNC('year', events.occurred_at) AS year,
                CAST(COUNT(DISTINCT
                  IF(
                    isNull(user_profiles.finalized_swishjam_user_id),
                    JSONExtractString(events.properties, 'device_identifier'),
                    user_profiles.finalized_swishjam_user_id
                  )
                ) AS INT) AS num_unique_users
              FROM events
              LEFT JOIN (
                SELECT 
                  swishjam_user_id, 
                  IF(
                    isNull(merged_into_swishjam_user_id), 
                    swishjam_user_id, 
                    merged_into_swishjam_user_id
                  ) AS finalized_swishjam_user_id
                FROM swishjam_user_profiles
                WHERE workspace_id = '#{@workspace_id}'
                GROUP BY swishjam_user_id
              ) AS user_profiles ON user_profiles.swishjam_user_id = events.user_profile_id
              WHERE
                events.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
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
end