module ClickHouseQueries
  module Organizations
    class Count
      def initialize(workspace_id, filter_groups: [])
        @workspace_id = workspace_id
        @filter_groups = filter_groups
        @columns = ['swishjam_organization_id']
        @columns << 'metadata' if @filter_groups.any?{ |fg| fg.query_filters.any?{ |f| f.is_a?(QueryFilters::ProfileProperty) }}
      end

      def get
        Analytics::ClickHouseRecord.execute_sql(sql.squish!).first['total_num_organizations']
      end

      def sql
        <<~SQL
          SELECT CAST(COUNT(DISTINCT organization_profiles.swishjam_organization_id) AS INT) AS total_num_organizations
          FROM (#{ClickHouseQueries::Common::DeDupedOrganizationProfilesQuery.sql(workspace_id: @workspace_id, columns: @columns)}) AS organization_profiles
          #{ClickHouseQueries::FilterHelpers::LeftJoinStatementsForEventCountByProfileFilters.left_join_statements(@filter_groups, workspace_id: @workspace_id, organizations_table_alias: 'organization_profiles')}
          WHERE #{ClickHouseQueries::FilterHelpers::WhereClauseForFilterGroups.where_clause_statements(@filter_groups, organizations_table_alias: 'organization_profiles')}
        SQL
      end
    end
  end
end