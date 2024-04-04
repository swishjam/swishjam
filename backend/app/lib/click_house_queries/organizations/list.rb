module ClickHouseQueries
  module Organizations
    class List
      include ClickHouseQueries::Helpers

      def initialize(
        workspace_id, 
        filter_groups: [], 
        columns: nil, 
        return_event_count_for_profile_filter_counts: true, 
        include_user_count: false,
        sort_by: nil, 
        page: 1, 
        limit: 25
      )
        @workspace_id = workspace_id.is_a?(Workspace) ? workspace_id.id : workspace_id
        @filter_groups = filter_groups
        @columns = columns || ['name', 'metadata', 'created_at']
        @return_event_count_for_profile_filter_counts = return_event_count_for_profile_filter_counts
        @include_user_count = include_user_count
        @sort_by = sort_by
        @page = page.to_i
        @limit = limit.to_i
        add_required_columns_if_necessary!
      end

      def get
        organizations = Analytics::ClickHouseRecord.execute_sql(sql.squish!)
        total_num_organizations = ClickHouseQueries::Organizations::Count.new(@workspace_id, filter_groups: @filter_groups).get
        {
          organizations: organizations,
          total_num_organizations: total_num_organizations,
          total_num_pages: (total_num_organizations.to_f / @limit.to_f).ceil,
        }.with_indifferent_access
      end

      def sql
        <<~SQL
          SELECT #{select_statement_for_columns_and_filter_groups}
          FROM (#{ClickHouseQueries::Common::DeDupedOrganizationProfilesQuery.sql(workspace_id: @workspace_id, columns: @columns)}) AS organization_profiles
          #{maybe_organization_members_join_statement}
          #{ClickHouseQueries::FilterHelpers::LeftJoinStatementsForEventCountByProfileFilters.left_join_statements(@filter_groups, workspace_id: @workspace_id, organizations_table_alias: 'organization_profiles')}
          WHERE #{ClickHouseQueries::FilterHelpers::WhereClauseForFilterGroups.where_clause_statements(@filter_groups)}
          #{maybe_group_by_statement}
          ORDER BY #{sort_by_column} DESC
          LIMIT #{@limit} OFFSET #{(@page - 1) * @limit}
        SQL
      end

      private

      def select_statement_for_columns_and_filter_groups
        sql = ''
        @columns.each_with_index do |column, i|
          if column == 'swishjam_organization_id'
            sql << "organization_profiles.swishjam_organization_id AS id, "
          end
          if column == 'created_at'
            sql << "#{select_clickhouse_timestamp_with_timezone('organization_profiles.created_at')} AS created_at"
          else
            sql << "organization_profiles.#{column} AS #{column}"
          end
          sql << ", " if i < @columns.length - 1
        end
        sql << ", COUNT(DISTINCT members.swishjam_user_id) AS num_users" if @include_user_count
        sql << maybe_event_count_select_statements
        sql
      end

      def maybe_event_count_select_statements
        sql = ''
        return sql if !@return_event_count_for_profile_filter_counts
        @filter_groups.each do |filter_group|
          query_filters = filter_group.query_filters.sort{ |f| f.sequence_index }
          query_filters.each do |filter|
            next if !filter.is_a?(QueryFilters::EventCountForUserOverTimePeriod) && !filter.is_a?(QueryFilters::EventCountForProfileOverTimePeriod)
            event_count_column_name = "#{ClickHouseQueries::FilterHelpers::LeftJoinStatementsForEventCountByProfileFilters.join_table_alias_for_event_count_for_profile_filter(filter)}.event_count_for_profile_within_lookback_period"
            sql << ", #{event_count_column_name} AS #{filter.config['event_name'].gsub(' ', '_').gsub('.', '_')}_count_for_organization"
          end
        end
        sql
      end

      def maybe_organization_members_join_statement
        return '' if !@include_user_count
        <<~SQL
          LEFT JOIN swishjam_organization_members AS members ON members.swishjam_organization_id = organization_profiles.swishjam_organization_id
        SQL
      end

      def maybe_group_by_statement
        return '' if !@include_user_count
        select_aliases_besides_user_count = select_statement_for_columns_and_filter_groups.scan(/AS (\w+)/).flatten.filter{ |alias_| alias_ != 'num_users' }
        <<~SQL
          GROUP BY #{sort_by_column}, #{select_aliases_besides_user_count.join(', ')}
        SQL
      end

      def sort_by_column
        @sort_by ||= begin
          flattened_query_filters = @filter_groups.map{ |fg| fg.query_filters }.flatten
          first_event_count_filter = flattened_query_filters.find{ |f| f.is_a?(QueryFilters::EventCountForUserOverTimePeriod) }
          return "#{ClickHouseQueries::FilterHelpers::LeftJoinStatementsForEventCountByProfileFilters.join_table_alias_for_event_count_for_profile_filter(first_event_count_filter)}.event_count_for_profile_within_lookback_period" if first_event_count_filter
          'organization_profiles.created_at'
        end
      end

      def add_required_columns_if_necessary!
        @columns << 'swishjam_organization_id' if !@columns.include?('swishjam_organization_id')
        @columns << 'created_at' if !@columns.include?('created_at') # needed for ordering
        @columns << 'metadata' if !@columns.include?('metadata') && @filter_groups.any?{ |fg| fg.query_filters.any?{ |f| f.is_a?(QueryFilters::ProfileProperty) }}
        @columns << 'name' if !@columns.include?('name') && @filter_groups.any?{ |fg| fg.query_filters.any?{ |f| f.is_a?(QueryFilters::ProfileProperty) && f.property_name == 'name' }}
      end
    end
  end
end