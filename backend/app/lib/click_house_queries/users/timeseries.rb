module ClickHouseQueries
  module Users
    class Timeseries
      include ClickHouseQueries::Helpers
      include TimeseriesHelper

      def initialize(workspace_id, start_time:, end_time:, group_by: nil, cohorts: [], public_keys: nil)
        raise NotImplementedError, '`ClickHouseQueries::Users::Timeseries` is not yet implemented.'
        @workspace_id = workspace_id
        @group_by = group_by || derived_group_by(start_ts: start_time, end_ts: end_time)
        @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by, round_up: true)
        @cohorts = cohorts
        @public_keys = public_keys
      end

      def get
        Analytics::ClickHouseRecord.execute_sql(sql.squish!)
      end

      def sql
        <<~SQL
          SELECT #{select_statement}
          FROM (#{datetimes_from_statement}) AS dates
          #{maybe_event_counts_left_join_statements}
          #{users_query_for_user_property_filters_if_any}
          GROUP BY time_period
          ORDER BY time_period
        SQL
      end

      def select_statement
        <<~SQL
          dates.date AS time_period,
          SUM(
            IF (#{ClickHouseQueries::FilterHelpers::WhereClauseForFilterGroups.where_clause_statements(@cohorts, users_table_alias: 'finalized_user_profiles')}, 1, 0)
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
        ClickHouseQueries::FilterHelpers::LeftJoinStatementsForEventCountByProfileFilters.left_join_statements(@cohorts, workspace_id: @workspace_id, as_timeseries: true)
      end

      def users_query_for_user_property_filters_if_any
        return ''
        <<~SQL
          RIGHT JOIN 
        SQL
      end

      def maybe_finalized_user_profiles_to_events_join_statement
        # TODO - I think we need to do a right join maybe? we don't want to tie it to the events, we just need all users?
        # idk it feels weird to have a timeseries filtered by a user property cause it's stateful, not event-based
        # @cohorts.map do |cohort|
        #   cohort.query_filter_groups.in_sequence_order.map do |filter|
        #     ClickHouseQueries::Common::FinalizedUserProfilesToEventsJoinQuery.sql(
        #       @workspace_id, 
        #       columns: ['email', 'metadata'], 
        #       table_alias: 'finalized_user_profiles', 
        #       # what happens if there's multiple cohorts...?
        #       event_table_alias: ClickHouseQueries::FilterHelpers::LeftJoinStatementsForEventCountByProfileFilters.join_table_alias_for_event_count_for_profile_filter(filter.config)
        #     )
        #   end
        # end
      end
    end
  end
end