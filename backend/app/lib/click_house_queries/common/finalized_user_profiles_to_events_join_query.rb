module ClickHouseQueries
  module Common
    class FinalizedUserProfilesToEventsJoinQuery
      def self.sql(workspace_id, columns: ['email', 'metadata'], table_alias: 'user_profiles', event_table_alias: 'e')
        columns.reject! { |column| column == 'swishjam_user_id' }
        <<~SQL
          LEFT JOIN (
            SELECT
              user_profile_at_time_of_event.swishjam_user_id AS og_swishjam_user_id,
              IF (
                isNull (user_profile_at_time_of_event.merged_into_swishjam_user_id), 
                user_profile_at_time_of_event.swishjam_user_id, 
                user_profile_at_time_of_event.merged_into_swishjam_user_id
              ) AS swishjam_user_id,
              #{select_clause_for_columns(columns)}
            FROM (#{DeDupedUserProfilesQuery.sql(workspace_id: workspace_id, columns: columns)}) AS user_profile_at_time_of_event
            LEFT JOIN (
              #{DeDupedUserProfilesQuery.sql(workspace_id: workspace_id, columns: columns)}
            ) AS profile_user_was_merged_into ON user_profile_at_time_of_event.merged_into_swishjam_user_id = profile_user_was_merged_into.swishjam_user_id
          ) AS #{table_alias} ON #{table_alias}.og_swishjam_user_id = #{event_table_alias}.user_profile_id
        SQL
      end
      
      def self.select_clause_for_columns(columns)
        columns.map do |column|
          <<~SQL 
            IF (
              isNull (user_profile_at_time_of_event.merged_into_swishjam_user_id), 
              user_profile_at_time_of_event.#{column}, 
              profile_user_was_merged_into.#{column}
            ) AS #{column}
          SQL
        end.join(', ')
      end
    end
  end
end