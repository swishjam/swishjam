module ClickHouseQueries
  module Events
    class Timeseries
      include ClickHouseQueries::Helpers
      include TimeseriesHelper

      def initialize(
        public_keys, 
        event:, 
        start_time:, 
        end_time:, 
        user_segments: [],
        workspace_id: nil, 
        user_profile_id: nil, 
        group_by: nil, 
        distinct_count_property: 'uuid'
      )
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @workspace_id = workspace_id
        @event = event
        @group_by = group_by || derived_group_by(start_ts: start_time, end_ts: end_time)
        @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        @user_segments = user_segments
        @user_profile_id = user_profile_id
        @distinct_count_property = distinct_count_property
        validate!
      end

      def get
        return @filled_in_results if defined?(@filled_in_results)
        data = Analytics::Event.find_by_sql(sql.squish!)
        DataFormatters::Timeseries.new(
          data, 
          start_time: @start_time, 
          end_time: @end_time, 
          group_by: @group_by, 
          value_method: :count, 
          date_method: :group_by_date,
        )
      end

      def sql
        <<~SQL
          SELECT
            CAST(COUNT(DISTINCT #{property_select_clause}) AS INT) AS count,
            DATE_TRUNC('#{@group_by}', e.occurred_at) AS group_by_date
          FROM (#{from_clause}) AS e
          #{join_statements}
          WHERE
            notEmpty(#{property_select_clause}) AND
            #{user_profile_id_where_clause} AND
            #{ClickHouseQueries::FilterHelpers::WhereClauseForFilterGroups.where_clause_statements(@user_segments, users_table_alias: 'user_profiles')}
          GROUP BY group_by_date
          ORDER BY group_by_date
        SQL
      end

      # helpful for when you just want the distinct count of a property across any kind of event (ie: session counts)
      def self.ANY_EVENT
        'any'
      end

      def property_select_clause
        if @distinct_count_property == 'users'
          <<~SQL
            IF(
              isNull(user_profiles.merged_into_swishjam_user_id),
              e.user_profile_id,
              user_profiles.merged_into_swishjam_user_id
            )
          SQL
        else
          "e.#{@distinct_count_property}"
        end
      end

      def from_clause
        distinct_count_property = @distinct_count_property.nil? || @distinct_count_property == 'users' ? 'uuid' : @distinct_count_property
        ClickHouseQueries::Common::DeDupedEventsQuery.sql(
          public_keys: @public_keys,
          start_time: @start_time,
          end_time: @end_time,
          event_name: @event,
          all_events: @event == self.class.ANY_EVENT,
          distinct_count_property: distinct_count_property,
        )
      end

      def join_statements
        sql = ''
        needs_finalized_user_properties = @user_segments.any?{ |seg| seg.query_filter_groups.any?{ |f| f.config['object_type'] == 'user' }}
        if (@distinct_count_property == 'users' || @user_profile_id.present?) && !needs_finalized_user_properties
          sql << <<~SQL
            LEFT JOIN (
              #{ClickHouseQueries::Common::DeDupedUserProfilesQuery.sql(workspace_id: @workspace_id, columns: [])}
            ) AS user_profiles ON user_profiles.swishjam_user_id = e.user_profile_id
          SQL
        elsif needs_finalized_user_properties
          sql << ClickHouseQueries::Common::FinalizedUserProfilesToEventsJoinQuery.sql(@workspace_id, columns: ['metadata'], table_alias: 'user_profiles', event_table_alias: 'e')
        end
        if @user_segments.any?
          sql << ClickHouseQueries::FilterHelpers::LeftJoinStatementsForEventCountByUserFilters.left_join_statements(@user_segments, workspace_id: @workspace_id, users_table_alias: 'user_profiles')
        end
        sql
      end

      def user_profile_id_where_clause
        return '1 = 1' unless @user_profile_id.present?
        <<~SQL
          (
            user_profiles.swishjam_user_id = '#{@user_profile_id}' OR 
            user_profiles.merged_into_swishjam_user_id = '#{@user_profile_id}'
          )
        SQL
      end

      def validate!
        if @user_profile_id.present? && @workspace_id.nil?
          raise ArgumentError, '`workspace_id` is required when `user_profile_id` is provided.'
        end
      end
    end
  end
end