module ClickHouseQueries
  module FilterHelpers
    class LeftJoinStatementsForEventCountByProfileFilters
      class InvalidConfigError < StandardError; end

      def self.left_join_statements(filter_groups, workspace_id:, as_timeseries: false, users_table_alias: 'user_profiles', organizations_table_alias: 'organization_profiles')
        sql = ''
        return sql if filter_groups.blank?
        filter_groups.each do |filter_group|
          query_filters = filter_group.query_filters.sort{ |f| f.sequence_index }
          query_filters.each do |filter|
            next if !filter.is_a?(QueryFilters::EventCountForProfileOverTimePeriod) && !filter.is_a?(QueryFilters::EventCountForUserOverTimePeriod)
            if filter.profile_type == 'user'
              sql << left_join_statement_for_event_count_for_user_filter(workspace_id, filter, as_timeseries: as_timeseries, users_table_alias: users_table_alias)
            elsif filter.profile_type == 'organization'
              sql << left_join_statement_for_event_count_for_organization_filter(workspace_id, filter, as_timeseries: as_timeseries, organizations_table_alias: organizations_table_alias)
            else 
              raise InvalidConfigError, "Invalid `profile_type`config in provided QueryFilter (#{filter.id}): #{filter.profile_type || 'UNDEFINED'}"
            end
          end
        end
        sql
      end

      def self.join_table_alias_for_event_count_for_profile_filter(filter)
        "#{filter.event_name.gsub(' ', '_').gsub('.', '_')}_event_count_for_#{filter.profile_type}_within_last_#{filter.num_lookback_days}_days"
      end

      private

      # gets the resolved user profile for the event
      # returns the new user profile if the event is associated to a user profile that has been merged
      def self.left_join_statement_for_event_count_for_user_filter(workspace_id, filter, as_timeseries: false, users_table_alias: 'user_profiles')
        <<~SQL
          LEFT JOIN (
            SELECT
              finalized_user_profiles.finalized_swishjam_user_id AS user_profile_id,
              #{as_timeseries ? 'toDateTime(e.occurred_at) AS event_date,' : ''}
              CAST(COUNT(DISTINCT e.uuid) AS INT) AS event_count_for_profile_within_lookback_period
            FROM events AS e
            LEFT JOIN (
              SELECT
                swishjam_user_id AS user_profile_id_at_time_of_event,
                argMax (merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id,
                IF (
                  isNull (merged_into_swishjam_user_id),
                  user_profile_id_at_time_of_event,
                  merged_into_swishjam_user_id
                ) AS finalized_swishjam_user_id
              FROM swishjam_user_profiles
              WHERE workspace_id = '#{workspace_id}'
              GROUP BY user_profile_id_at_time_of_event
            ) AS finalized_user_profiles ON e.user_profile_id = finalized_user_profiles.user_profile_id_at_time_of_event
            WHERE
              e.name = '#{filter.event_name}' AND 
              date_diff ('minute', e.occurred_at, #{as_timeseries ? "toDateTime(subtractMinutes(event_date, #{filter.num_lookback_days * 24 * 60}))" : 'now()'}, 'UTC') <= #{filter.num_lookback_days * 24 * 60}
            GROUP BY user_profile_id #{as_timeseries ? ', event_date' : ''}
          ) AS #{join_table_alias_for_event_count_for_profile_filter(filter)} ON #{as_timeseries ? "dates.date = #{join_table_alias_for_event_count_for_profile_filter(filter)}.event_date" : "#{users_table_alias}.swishjam_user_id = #{join_table_alias_for_event_count_for_profile_filter(filter)}.user_profile_id"}
        SQL
      end

      def self.left_join_statement_for_event_count_for_organization_filter(workspace_id, filter, as_timeseries: false, organizations_table_alias: 'organization_profiles')
        <<~SQL
          LEFT JOIN (
            SELECT
              e.organization_profile_id AS organization_profile_id,
              #{as_timeseries ? 'toDateTime(e.occurred_at) AS event_date,' : ''}
              CAST(COUNT(DISTINCT e.uuid) AS INT) AS event_count_for_profile_within_lookback_period
            FROM events AS e
            WHERE
              e.name = '#{filter.event_name}' AND 
              date_diff ('minute', e.occurred_at, #{as_timeseries ? "toDateTime(subtractMinutes(event_date, #{filter.num_lookback_days * 24 * 60}))" : 'now()'}, 'UTC') <= #{filter.num_lookback_days * 24 * 60}
            GROUP BY organization_profile_id #{as_timeseries ? ', event_date' : ''}
          ) AS #{join_table_alias_for_event_count_for_profile_filter(filter)} ON #{as_timeseries ? "dates.date = #{join_table_alias_for_event_count_for_profile_filter(filter)}.event_date" : "#{organizations_table_alias}.swishjam_organization_id = #{join_table_alias_for_event_count_for_profile_filter(filter)}.organization_profile_id"}
        SQL
      end
    end
  end
end