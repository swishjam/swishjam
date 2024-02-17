module ClickHouseQueries
  module Users
    class List
      include ClickHouseQueries::Helpers

      def initialize(workspace_id, user_segments: [], columns: nil, return_user_segment_event_counts: true, page: 1, limit: 25)
        @workspace_id = workspace_id.is_a?(Workspace) ? workspace_id.id : workspace_id
        @user_segments = user_segments
        @columns = columns || ['email', 'metadata', 'first_seen_at_in_web_app', 'created_at']
        @columns << 'swishjam_user_id' if !@columns.include?('swishjam_user_id')
        @columns << 'created_at' if !@columns.include?('created_at') # needed for ordering
        @return_user_segment_event_counts = return_user_segment_event_counts
        @page = page.to_i
        @limit = limit.to_i
      end

      def get
        users = Analytics::ClickHouseRecord.execute_sql(sql.squish!)
        total_num_users = ClickHouseQueries::Users::Count.new(@workspace_id, user_segments: @user_segments).get['total_num_users']
        {
          users: users,
          total_num_users: total_num_users,
          total_num_pages: (total_num_users.to_f / @limit.to_f).ceil,
        }.with_indifferent_access
      end

      def sql
        <<~SQL
          SELECT #{select_statement_for_columns_and_user_segments}
          FROM (#{ClickHouseQueries::Common::DeDupedUserProfilesQuery.sql(workspace_id: @workspace_id, columns: @columns)}) AS user_profiles
          #{ClickHouseQueries::FilterHelpers::LeftJoinStatementsForUserSegmentsEventCountFilters.left_join_statements(@user_segments)}
          WHERE 
            isNull(user_profiles.merged_into_swishjam_user_id) AND
            #{ClickHouseQueries::FilterHelpers::UserSegmentFilterWhereClause.where_clause_statements(@user_segments)}
          ORDER BY user_profiles.created_at DESC
          LIMIT #{@limit} OFFSET #{(@page - 1) * @limit}
        SQL
      end

      def select_statement_for_columns_and_user_segments
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
        return sql if !@return_user_segment_event_counts
        @user_segments.each do |user_segment|
          user_segment.user_segment_filters.each do |filter|
            next if filter.config['object_type'] != 'event'
            event_count_column_name = "#{ClickHouseQueries::FilterHelpers::LeftJoinStatementsForUserSegmentsEventCountFilters.join_table_alias_for_segment_filter(filter.config)}.event_count_for_user_within_lookback_period"
            sql << ", #{event_count_column_name} AS #{filter.config['event_name'].gsub(' ', '_')}_count_for_user"
          end
        end
        sql
      end

    end
  end
end