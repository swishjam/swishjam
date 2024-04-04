module ClickHouseQueries
  module Organizations
    class Count
      def initialize(workspace_id, filter_groups: [])
        @workspace_id = workspace_id
        @filter_groups = filter_groups
      end

      def get
        Analytics::ClickHouseRecord.execute_sql(sql.squish!).first['total_num_organizations']
      end

      def sql
        <<~SQL
          SELECT CAST(COUNT(DISTINCT swishjam_organization_id) AS INT) AS total_num_organizations
          FROM swishjam_organization_profiles AS organization_profiles
          #{ClickHouseQueries::FilterHelpers::LeftJoinStatementsForEventCountByProfileFilters.left_join_statements(@filter_groups, workspace_id: @workspace_id)}
          WHERE 
            workspace_id = '#{@workspace_id}' AND
            #{ClickHouseQueries::FilterHelpers::WhereClauseForFilterGroups.where_clause_statements(@filter_groups)}
        SQL
      end
    end
  end
end