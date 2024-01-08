module ClickHouseQueries
  module Users
    module Events
      class List
        include ClickHouseQueries::Helpers
        
        def initialize(public_keys, user_profile:, limit: 10, start_time: 6.months.ago, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_key]
          @user_profile_id = user_profile.id
          @user_unique_identifier = user_profile.user_unique_identifier
          @limit = limit
          @start_time = start_time
          @end_time = end_time
        end

        def get
          Analytics::Event.find_by_sql(sql)
        end

        def sql
          <<~SQL
            SELECT e.name, e.properties, e.occurred_at
            FROM events AS e
            LEFT JOIN (
              SELECT
                device_identifier,
                argMax(swishjam_user_id, occurred_at) AS swishjam_user_id
              FROM user_identify_events AS uie
              WHERE swishjam_api_key IN #{formatted_in_clause(@public_keys)}
              GROUP BY device_identifier
            ) AS uie ON 
              JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER}') = uie.device_identifier AND 
              uie.swishjam_user_id = '#{@user_profile_id}'
            WHERE 
              e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              (
                uie.swishjam_user_id = '#{@user_profile_id}' OR 
                JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.USER_PROFILE_ID}') = '#{@user_profile_id}' OR
                JSONExtractString(e.properties, 'user_unique_identifier') = '#{@user_unique_identifier}'
              )
            ORDER BY e.occurred_at DESC
            LIMIT #{@limit}
          SQL
        end
      end
    end
  end
end