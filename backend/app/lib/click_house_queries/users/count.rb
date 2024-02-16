module ClickHouseQueries
  module Users
    class Count
      def initialize(workspace_id, user_segments: [])
        @workspace_id = workspace_id
        @user_segments = user_segments
      end

      def get
        Analytics::ClickHouseRecord.execute_sql(sql.squish!).first
      end

      def sql
        <<~SQL
          SELECT 
            CAST(COUNT(DISTINCT user_profiles.swishjam_user_id) AS INT) AS total_num_users,
            CAST(COUNT(DISTINCT IF(isNotNull(user_profiles.user_unique_identifier), user_profiles.swishjam_user_id, NULL)) AS INT) AS total_num_identified_users
          FROM (#{ClickHouseQueries::Common::DeDupedUserProfilesFromClause.from_clause(workspace_id: @workspace_id, columns_to_return: ['metadata', 'user_unique_identifier'])}) AS user_profiles
          #{ClickHouseQueries::FilterHelpers::LeftJoinStatementsForUserSegmentsEventFilters.left_join_statements(@user_segments)}
          WHERE 
            isNull(user_profiles.merged_into_swishjam_user_id) AND
            #{ClickHouseQueries::FilterHelpers::UserSegmentFilterWhereClause.where_clause_statements(@user_segments)}
        SQL
      end
    end
  end
end