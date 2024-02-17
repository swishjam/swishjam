module ClickHouseQueries
  module Users
    class Timeseries
      include ClickHouseQueries::Helpers
      include TimeseriesHelper

      def initialize(workspace_id, start_time:, end_time:, group_by: nil, user_segments: [], public_keys: nil)
        @workspace_id = workspace_id
        @group_by = group_by || derived_group_by(start_ts: start_time, end_ts: end_time)
        @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by, round_up: true)
        @user_segments = user_segments
        @public_keys = public_keys
      end

      def get
        byebug
        Analytics::ClickHouseRecord.execute_sql(sql.squish!)
      end

      def sql
        <<~SQL
          SELECT #{select_statement}
          FROM (#{datetimes_from_statement}) AS dates
          #{maybe_event_counts_left_join_statements}
          #{maybe_finalized_user_profiles_to_events_join_statement}
          GROUP BY time_period
          ORDER BY time_period
        SQL
      end

      def select_statement
        <<~SQL
          dates.date AS time_period,
          SUM(
            IF (#{ClickHouseQueries::FilterHelpers::UserSegmentFilterWhereClause.where_clause_statements(@user_segments, users_table_alias: 'finalized_user_profiles')}, 1, 0)
          ) AS user_count
        SQL
      end

      def datetimes_from_statement
        <<~SQL
          SELECT toDateTime(subtract#{@group_by.to_s.capitalize}s(toDateTime('#{formatted_time(@end_time)}'), number)) AS date
          FROM system.numbers
          LIMIT datediff ('#{@group_by}', toDateTime('#{formatted_time(@start_time)}'), toDateTime('#{formatted_time(@end_time)}'))
        SQL
      end

      def maybe_event_counts_left_join_statements
        ClickHouseQueries::FilterHelpers::LeftJoinStatementsForUserSegmentsEventCountFilters.left_join_statements(@user_segments, as_timeseries: true)
      end

      def maybe_finalized_user_profiles_to_events_join_statement
        # TODO - I think we need to do a right join maybe? we don't want to tie it to the events, we just need all users?
        # idk it feels weird to have a timeseries filtered by a user property cause it's stateful, not event-based
        # @user_segments.map do |user_segment|
        #   user_segment.user_segment_filters.in_order.map do |filter|
        #     ClickHouseQueries::Common::FinalizedUserProfilesToEventsJoinQuery.sql(
        #       @workspace_id, 
        #       columns: ['email', 'metadata'], 
        #       table_alias: 'finalized_user_profiles', 
        #       # what happens if there's multiple user segments...?
        #       event_table_alias: ClickHouseQueries::FilterHelpers::LeftJoinStatementsForUserSegmentsEventCountFilters.join_table_alias_for_segment_filter(filter.config)
        #     )
        #   end
        # end
      end
    end
  end
end