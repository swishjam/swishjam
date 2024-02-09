module ClickHouseQueries
  module Common
    class JoinFinalizedUserProfilesToEvents
      def self.sql(workspace_id, columns: ['swishjam_user_id', 'email', 'metadata'], as: 'user_profiles', event_table_alias: 'e')
        <<~SQL
          LEFT JOIN (
            SELECT
              u.swishjam_user_id AS og_swishjam_user_id,
              #{columns.map do |column|
                "IF (isNull (u.merged_into_swishjam_user_id), u.#{column}, merged_into_profile.#{column}) AS #{column}"
              end.join(', ')}
            FROM
              swishjam_user_profiles AS u
              LEFT JOIN (
                SELECT
                  swishjam_user_id AS swishjam_user_id,
                  email AS email,
                  metadata AS metadata
                FROM
                  swishjam_user_profiles
                WHERE
                  workspace_id = '#{workspace_id}'
              ) AS merged_into_profile ON u.merged_into_swishjam_user_id = merged_into_profile.swishjam_user_id
          ) AS #{as} ON #{as}.og_swishjam_user_id = e.user_profile_id
        SQL
      end
    end
  end
end