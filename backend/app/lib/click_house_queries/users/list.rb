module ClickHouseQueries
  module Users
    class List
      include ClickHouseQueries::Helpers

      def initialize(workspace_id, filter_groups: [], columns: nil, return_event_count_for_profile_filter_counts: true, sort_by: nil, page: 1, limit: 25)
        @workspace_id = workspace_id.is_a?(Workspace) ? workspace_id.id : workspace_id
        @filter_groups = filter_groups
        @columns = columns || ['email', 'metadata', 'created_at']
        @return_event_count_for_profile_filter_counts = return_event_count_for_profile_filter_counts
        @sort_by = sort_by
        @page = page.to_i
        @limit = limit.to_i
        add_required_columns_if_necessary!
      end

      def get
        users = Analytics::ClickHouseRecord.execute_sql(sql.squish!)
        total_num_users = ClickHouseQueries::Users::Count.new(@workspace_id, filter_groups: @filter_groups).get['total_num_users']
        {
          users: users,
          total_num_users: total_num_users,
          total_num_pages: (total_num_users.to_f / @limit.to_f).ceil,
        }.with_indifferent_access
      end

      def sql
        <<~SQL
          SELECT #{select_statement_for_columns_and_filter_groups}
          FROM (#{ClickHouseQueries::Common::DeDupedUserProfilesQuery.sql(workspace_id: @workspace_id, columns: @columns)}) AS user_profiles
          #{ClickHouseQueries::FilterHelpers::LeftJoinStatementsForEventCountByProfileFilters.left_join_statements(@filter_groups, workspace_id: @workspace_id)}
          WHERE 
            isNull(user_profiles.merged_into_swishjam_user_id) AND
            (#{ClickHouseQueries::FilterHelpers::WhereClauseForFilterGroups.where_clause_statements(@filter_groups)})
          ORDER BY #{sort_by_column} DESC
          LIMIT #{@limit} OFFSET #{(@page - 1) * @limit}
        SQL
      end

      private

      def select_statement_for_columns_and_filter_groups
        sql = ''
        @columns.each_with_index do |column, i|
          if column == 'created_at'
            sql << "#{select_clickhouse_timestamp_with_timezone('user_profiles.created_at')} AS created_at"
          else
            sql << "user_profiles.#{column} AS #{column}"
          end
          sql << ", " if i < @columns.length - 1
        end
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
            sql << ", #{event_count_column_name} AS #{filter.config['event_name'].gsub(' ', '_').gsub('.', '_')}_count_for_user"
          end
        end
        sql
      end

      def sort_by_column
        @sort_by ||= begin
          flattened_query_filters = @filter_groups.map{ |fg| fg.query_filters }.flatten
          first_event_count_filter = flattened_query_filters.find{ |f| f.is_a?(QueryFilters::EventCountForUserOverTimePeriod) }
          return "#{ClickHouseQueries::FilterHelpers::LeftJoinStatementsForEventCountByProfileFilters.join_table_alias_for_event_count_for_profile_filter(first_event_count_filter)}.event_count_for_profile_within_lookback_period" if first_event_count_filter
          'user_profiles.created_at'
        end
      end

      def add_required_columns_if_necessary!
        @columns << 'swishjam_user_id' if !@columns.include?('swishjam_user_id')
        @columns << 'created_at' if !@columns.include?('created_at') && sort_by_column == 'user_profiles.created_at'
        @columns << 'metadata' if !@columns.include?('metadata') && @filter_groups.any?{ |fg| fg.query_filters.any?{ |f| f.is_a?(QueryFilters::ProfileProperty) && f.property_name != 'email' && f.property_name != 'user_unique_identifier' }}
        @columns << 'email' if !@columns.include?('email') && @filter_groups.any?{ |fg| fg.query_filters.any?{ |f| f.is_a?(QueryFilters::ProfileProperty) && f.property_name == 'email' }}
        @columns << 'user_unique_identifier' if !@columns.include?('user_unique_identifier') && @filter_groups.any?{ |fg| fg.query_filters.any?{ |f| f.is_a?(QueryFilters::ProfileProperty) && f.property_name == 'user_unique_identifier' }}
      end
    end
  end
end