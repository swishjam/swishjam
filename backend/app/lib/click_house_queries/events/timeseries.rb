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
        workspace_id: nil, 
        user_profile_id: nil, 
        organization_profile_id: nil,
        group_by: nil, 
        distinct_count_property: 'uuid'
      )
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @workspace_id = workspace_id
        @event = event
        @group_by = group_by || derived_group_by(start_ts: start_time, end_ts: end_time)
        @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        @user_profile_id = user_profile_id
        @organization_profile_id = organization_profile_id
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
          #{maybe_users_join_statement}
          WHERE
            notEmpty(#{property_select_clause}) AND
            #{maybe_user_profile_id_where_clause} AND
            #{maybe_organization_profile_id_where_clause}
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
        columns = ['occurred_at']
        columns << 'name' unless @event == self.class.ANY_EVENT
        columns << 'properties' if !['uuid', 'name', 'users'].include?(@distinct_count_property)
        columns << 'user_profile_id' if @user_profile_id
        columns << 'organization_profile_id' if @organization_profile_id
        ClickHouseQueries::Common::DeDupedEventsQuery.sql(
          public_keys: @public_keys,
          start_time: @start_time,
          end_time: @end_time,
          event_name: @event,
          all_events: @event == self.class.ANY_EVENT,
          columns: columns,
          distinct_count_property: @distinct_count_property.nil? || @distinct_count_property == 'users' ? 'uuid' : @distinct_count_property,
        )
      end

      def maybe_users_join_statement
        sql = ''
        if @distinct_count_property == 'users' || @user_profile_id.present?
          sql << <<~SQL
            LEFT JOIN (
              #{ClickHouseQueries::Common::DeDupedUserProfilesQuery.sql(workspace_id: @workspace_id, columns: ['merged_into_swishjam_user_id'])}
            ) AS user_profiles ON user_profiles.swishjam_user_id = e.user_profile_id
          SQL
        end
        sql
      end

      def maybe_user_profile_id_where_clause
        return '1 = 1' unless @user_profile_id.present?
        <<~SQL
          (
            user_profiles.swishjam_user_id = '#{@user_profile_id}' OR 
            user_profiles.merged_into_swishjam_user_id = '#{@user_profile_id}'
          )
        SQL
      end

      def maybe_organization_profile_id_where_clause
        return '1 = 1' unless @organization_profile_id.present?
        <<~SQL
          e.organization_profile_id = '#{@organization_profile_id}'
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