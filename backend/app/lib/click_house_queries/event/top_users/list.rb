module ClickHouseQueries
  module Event
    module TopUsers
      class List
        include ClickHouseQueries::Helpers

        def initialize(public_keys, workspace_id:, event_name:, limit: 10, start_time: 6.months.ago, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @workspace_id = workspace_id
          @event_name = event_name
          @limit = limit
          @start_time = start_time
          @end_time = end_time
        end

        def get
          @data ||= Analytics::ClickHouseRecord.execute_sql(sql.squish!)
        end

        def sql
          <<~SQL
            SELECT 
              user_profiles.swishjam_user_id AS user_profile_id,
              user_profiles.email AS email,
              user_profiles.metadata AS metadata,
              CAST(COUNT(DISTINCT e.uuid) AS INT) AS count
            FROM events AS e
            #{ClickHouseQueries::Common::JoinFinalizedUserProfilesToEvents.sql(@workspace_id, as: 'user_profiles')}
            WHERE
              e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              e.name = '#{@event_name}' AND
              e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
            GROUP BY user_profile_id, email, metadata
            ORDER BY count DESC
            LIMIT #{@limit}
          SQL
        end
      end
    end
  end
end