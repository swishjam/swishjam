module ClickHouseQueries
  module Users
    class Count
      def initialize(workspace_id, filter_groups: [])
        @workspace_id = workspace_id
        @filter_groups = filter_groups
      end

      def get
        Analytics::ClickHouseRecord.execute_sql(sql.squish!).first
      end

      def sql
        <<~SQL
          SELECT 
            CAST(COUNT(DISTINCT user_profiles.swishjam_user_id) AS INT) AS total_num_users,
            CAST(COUNT(DISTINCT IF(isNotNull(user_profiles.user_unique_identifier), user_profiles.swishjam_user_id, NULL)) AS INT) AS total_num_identified_users
          FROM (#{ClickHouseQueries::Common::DeDupedUserProfilesQuery.sql(workspace_id: @workspace_id, columns: columns_needed_based_on_filters)}) AS user_profiles
          #{ClickHouseQueries::FilterHelpers::LeftJoinStatementsForEventCountByUserFilters.left_join_statements(@filter_groups, workspace_id: @workspace_id)}
          WHERE 
            isNull(user_profiles.merged_into_swishjam_user_id) AND
            #{ClickHouseQueries::FilterHelpers::WhereClauseForFilterGroups.where_clause_statements(@filter_groups)}
        SQL
      end

      private

      def columns_needed_based_on_filters
        columns = ['swishjam_user_id', 'user_unique_identifier']
        columns << 'metadata' if @filter_groups.any?{ |fg| fg.query_filters.any?{ |f| f.is_a?(QueryFilters::UserProperty) && !['email', 'user_unique_identifier'].include?(f.property_name) }}
        columns << 'email' if @filter_groups.any?{ |fg| fg.query_filters.any?{ |f| f.is_a?(QueryFilters::UserProperty) && f.property_name == 'email' }}
        columns << 'user_unique_identifier' if @filter_groups.any?{ |fg| fg.query_filters.any?{ |f| f.is_a?(QueryFilters::UserProperty) && f.property_name == 'user_unique_identifier' }}
        columns
      end
    end
  end
end