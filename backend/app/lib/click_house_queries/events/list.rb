module ClickHouseQueries
  module Events
    class List
      # returns either:
      # - a list of all events and when they occurred with its properties when no event or property is specified
      # - a list of all the values and how many times it occured for a specified event and property
      include ClickHouseQueries::Helpers

      def initialize(
        public_keys, 
        start_time:, 
        end_time:, 
        workspace_id: nil, 
        event: nil, 
        events: nil, 
        property: nil, 
        user_profile_id: nil, 
        organization_profile_id: nil, 
        limit: 10
      )
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @start_time = start_time
        @end_time = end_time
        @event = event || events
        @workspace_id = workspace_id
        @property = property
        @user_profile_id = user_profile_id
        @organization_profile_id = organization_profile_id
        @limit = limit
        validate!
      end

      def get
        Analytics::Event.find_by_sql(sql.squish!)
      end

      def sql
        <<~SQL
          SELECT #{select_clause}
          FROM (#{de_duped_events_query}) AS e
          #{maybe_user_profile_join_statement}
          WHERE #{maybe_user_profile_id_where_clause} 
          #{maybe_group_by_clause}
          ORDER BY #{order_by_clause}
          #{@limit.nil? ? '' : "LIMIT #{@limit}"}
        SQL
      end

      def de_duped_events_query
        needed_columns = ['name', 'occurred_at', 'properties']
        needed_columns << 'user_profile_id' if @user_profile_id
        needed_columns << 'organization_profile_id' if @organization_profile_id
        <<~SQL
          SELECT uuid, #{needed_columns.map{ |column| "argMax(#{column}, ingested_at) AS #{column}" }.join(', ')}
          FROM events AS e
          WHERE 
            #{event_name_where_clause} AND
            #{maybe_organization_profile_id_where_clause} AND
            e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
          GROUP BY e.uuid
        SQL
      end

      def select_clause
        if @event && @property
          <<~SQL
            JSONExtractString(e.properties, '#{@property}') AS #{@property},
            CAST(COUNT(DISTINCT e.uuid) AS INT) AS count
          SQL
        else
          <<~SQL
            e.name AS name, 
            e.occurred_at AS occurred_at,
            e.properties AS properties
          SQL
        end
      end

      def maybe_user_profile_join_statement
        return '' unless @user_profile_id
        <<~SQL
          LEFT JOIN (
            SELECT 
              swishjam_user_id, 
              argMax(merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id
            FROM swishjam_user_profiles
            WHERE workspace_id = '#{@workspace_id}'
            GROUP BY swishjam_user_id
          ) AS user_profiles ON user_profiles.swishjam_user_id = e.user_profile_id
        SQL
      end

      def event_name_where_clause
        if @event.nil?
          '1 = 1'
        elsif @event.is_a?(Array)
          "e.name IN #{formatted_in_clause(@event)}"
        else
          "e.name = '#{@event}'"
        end
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

      def maybe_group_by_clause
        return '' unless @event && @property
        "GROUP BY #{@property}"
      end

      def order_by_clause
        return 'count DESC' if @event && @property
        'occurred_at DESC'
      end

      def validate!
        if @user_profile_id.present? && @workspace_id.nil?
          raise ArgumentError, '`workspace_id` is required when `user_profile_id` is provided.'
        end
      end
    end
  end
end