module ClickHouseQueries
  module Events
    class List
      # returns either:
      # - a list of events with when it occurred and its properties
      # - a list of all the values and how many times it occured for a specified event and property
      include ClickHouseQueries::Helpers

      def initialize(public_keys, start_time:, end_time:, workspace_id: nil, event: nil, property: nil, user_profile_id: nil, limit: 10)
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @start_time = start_time
        @end_time = end_time
        @event = event
        @workspace_id = workspace_id
        @property = property
        @user_profile_id = user_profile_id
        @limit = limit
      end

      def get
        Analytics::Event.find_by_sql(sql.squish!)
      end

      def sql
        <<~SQL
<<<<<<< HEAD
          SELECT
            e.uuid,
            #{select_clause}
          FROM events AS e
          #{join_statements}
          WHERE
            e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
            #{user_profile_id_where_clause} #{event_where_clause}
          GROUP BY e.uuid #{group_by_clause}
          ORDER BY #{order_by_clause}
          LIMIT #{@limit}
        SQL
      end

      def select_clause
        if @event && @property
          <<~SQL
            JSONExtractString(properties, '#{@property}') AS #{@property},
            CAST(COUNT(DISTINCT uuid) AS INT) AS count
          SQL
        else
          "e.name, e.occurred_at, e.properties"
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

      def user_profile_id_where_clause
        return '' unless @user_profile_id.present?
        sql = <<~SQL
          AND (
            user_profiles.swishjam_user_id = '#{@user_profile_id}' OR 
            user_profiles.merged_into_swishjam_user_id = '#{@user_profile_id}'
          )
        SQL
        sql.prepend(' ') unless sql.start_with?(' ')
        sql
      end

      def event_where_clause
        return '' unless @event
        " AND e.name = '#{@event}'"
      end

      def group_by_clause
        return ", #{@property}" if @event && @property
        ", e.uuid, e.occurred_at, e.name, e.properties"
      end

      def order_by_clause
        return 'e.occurred_at DESC' unless @event && @property
        'count DESC'
      end
=======
          SELECT 
            uuid,
            MAX(occurred_at) AS occurred_at,
            argMax(name, e.occurred_at) AS name, 
            argMax(properties, e.occurred_at) AS properties
          FROM events AS e
          WHERE 
            e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
            e.name IN #{formatted_in_clause(@event_names)}
          GROUP BY uuid
        SQL
      end
>>>>>>> main
    end
  end
end