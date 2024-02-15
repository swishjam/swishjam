module ClickHouseQueries
  module Users
    class List
      include ClickHouseQueries::Helpers

      def initialize(workspace_id, user_segments: [], page: 1, limit: 25)
        @workspace_id = workspace_id.is_a?(Workspace) ? workspace_id.id : workspace_id
        @user_segments = user_segments
        @page = page.to_i
        @limit = limit.to_i
      end

      def get
        users = Analytics::ClickHouseRecord.execute_sql(list_users_sql.squish!)
        total_num_users = Analytics::ClickHouseRecord.execute_sql(total_num_users_sql.squish!).first['total_num_users']
        {
          users: users,
          total_num_users: total_num_users,
          total_num_pages: (total_num_users.to_f / @limit.to_f).ceil,
        }.with_indifferent_access
      end

      def total_num_users_sql
        <<~SQL
          SELECT CAST(COUNT(DISTINCT user_profiles.swishjam_user_id) AS INT) AS total_num_users
          FROM swishjam_user_profiles AS user_profiles
          #{maybe_event_table_join_clause}
          WHERE 
            user_profiles.workspace_id = '#{@workspace_id}' AND
            isNull(user_profiles.merged_into_swishjam_user_id) AND
            #{user_segment_filter_where_clause}
        SQL
      end

      def list_users_sql
        <<~SQL
          SELECT 
            user_profiles.swishjam_user_id AS swishjam_user_id, 
            user_profiles.email AS email, 
            user_profiles.metadata AS metadata, 
            #{select_clickhouse_timestamp_with_timezone('created_at')}, 
            user_profiles.first_seen_at_in_web_app AS first_seen_at_in_web_app
          FROM (
            SELECT 
              swishjam_user_id,
              argMax(merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id,
              argMax(email, updated_at) AS email,
              argMax(metadata, updated_at) AS metadata,
              argMax(created_at, updated_at) AS created_at,
              argMax(first_seen_at_in_web_app, updated_at) AS first_seen_at_in_web_app
            FROM swishjam_user_profiles
            WHERE workspace_id = '#{@workspace_id}'
            GROUP BY swishjam_user_id
          ) AS user_profiles
          #{maybe_event_table_join_clause}
          WHERE 
            isNull(user_profiles.merged_into_swishjam_user_id) AND
            #{user_segment_filter_where_clause}
          ORDER BY user_profiles.created_at DESC
          LIMIT #{@limit} OFFSET #{(@page - 1) * @limit}
        SQL
      end

      def maybe_event_table_join_clause
        sql = ''
        should_join_events_table = @user_segments.any? && @user_segments.map(&:user_segment_filters).flatten.any? { |f| f.config['object_type'] == 'event' }
        return sql if !should_join_events_table
        @user_segments.each do |user_segment|
          user_segment.user_segment_filters.each do |filter|
            next if filter.config['object_type'] != 'event'
            sql << ClickHouseQueries::Common::LeftJoinStatementsForUserSegmentEventFilter.left_join_statement(filter.config)
          end
        end
        sql
      end

      def user_segment_filter_where_clause
        return "1 = 1" if @user_segments.empty?
        query = ""
        @user_segments.each_with_index do |user_segment, i|
          query << " AND " if i > 0
          query << " ( "
          user_segment.user_segment_filters.order(sequence_position: :ASC).each do |filter|
            query << " #{filter.parent_relationship_operator} " if filter.parent_relationship_operator.present?
            case filter.config['object_type']
            when 'user'
              query << ClickHouseQueries::Common::WhereClauseForUserSegmentUserPropertyFilter.where_clause_statement(filter.config, users_table_alias: 'user_profiles')
            when 'event'
              # query << ClickHouseQueries::Common::WhereClauseForUserSegmentEventFilter.where_clause_statement(filter.config, events_table_alias: 'events')
              query << "#{filter.config['event_name']}_count_for_user.event_count_for_user_within_lookback_period >= #{filter.config['num_event_occurrences']}"
            else
              raise "Unknown `object_type` in `UserSegmentFilter`: #{filter.config['object_type']}"
            end
          end
          query << " ) "
        end
        query
      end

    end
  end
end