module ClickHouseQueries
  module Events
    class List
      # returns either:
      # - a list of events with when it occurred and its properties when no event or property is specified
      # - a list of all the values and how many times it occured for a specified event and property
      include ClickHouseQueries::Helpers

      def initialize(public_keys, start_time:, end_time:, workspace_id: nil, event: nil, events: nil, property: nil, user_profile_id: nil, limit: 10)
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @start_time = start_time
        @end_time = end_time
        @event = event || events
        @workspace_id = workspace_id
        @property = property
        @user_profile_id = user_profile_id
        @limit = limit
        validate!
      end

      def get
        Analytics::Event.find_by_sql(sql.squish!)
      end

      def sql
        <<~SQL
          SELECT #{select_clause}
          FROM (#{from_clause}) AS e
          #{join_statements}
          WHERE
            #{event_where_clause}
            #{maybe_user_profile_id_where_clause} 
          #{group_by_clause.blank? ? '' : "GROUP BY #{group_by_clause}"}
          ORDER BY #{order_by_clause}
          #{@limit.nil? ? '' : "LIMIT #{@limit}"}
        SQL
      end

      def from_clause
        <<~SQL
          SELECT 
            uuid, 
            argMax(name, ingested_at) AS name, 
            argMax(occurred_at, ingested_at) AS occurred_at, 
            argMax(properties, ingested_at) AS properties, 
            argMax(user_properties, ingested_at) AS user_properties,
            argMax(user_profile_id, ingested_at) AS user_profile_id
          FROM events AS e
          WHERE 
            e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
          GROUP BY e.uuid
          #{@limit.nil? ? '' : "LIMIT #{@limit}"}
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

      def join_statements
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

      def event_where_clause
        return '1 = 1' unless @event
        if @event.is_a?(Array)
          "e.name IN #{formatted_in_clause(@event)}"
        else
          "e.name = '#{@event}'"
        end
      end

      def maybe_user_profile_id_where_clause
        return '' unless @user_profile_id.present?
        <<~SQL
           AND (
            user_profiles.swishjam_user_id = '#{@user_profile_id}' OR 
            user_profiles.merged_into_swishjam_user_id = '#{@user_profile_id}'
          )
        SQL
      end

      def group_by_clause
        return '' unless @event && @property
        @property
      end

      def order_by_clause
        return 'occurred_at DESC' unless @event && @property
        'count DESC'
      end

      def validate!
        if @user_profile_id.present? && @workspace_id.nil?
          raise ArgumentError, '`workspace_id` is required when `user_profile_id` is provided.'
        end
      end
    end
  end
end