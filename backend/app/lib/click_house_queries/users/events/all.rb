module ClickHouseQueries
  module Users
    module Events
      class All
        include ClickHouseQueries::Helpers
        
        def initialize(public_key, user_profile_id:, limit: 10, start_time: 6.months.ago, end_time: Time.current)
          @public_key = public_key
          @user_profile_id = user_profile_id
          @limit = limit
          @start_time = start_time
          @end_time = end_time
        end

        def get
          Analytics::Event.find_by_sql(sql)
        end

        def sql
          join_statement = ClickHouseQueries::Common.most_recent_identify_join(api_key: @public_key, events_table: 'e', user_identify_table: 'uie')
          <<~SQL
            SELECT 
              e.uuid AS uuid,
              e.swishjam_api_key AS swishjam_api_key,
              e.name AS name, 
              e.properties AS properties, 
              e.device_identifier AS device_identifier,
              e.occurred_at AS occurred_at, 
              e.ingested_at AS ingested_at
            FROM events AS e
            JOIN (
              SELECT
                device_identifier,
                MAX(occurred_at) AS max_occurred_at,
                argMax(swishjam_user_id, occurred_at) AS swishjam_user_id
              FROM user_identify_events AS uie
              WHERE swishjam_api_key = '#{@public_key}'
              GROUP BY device_identifier
            ) AS uie ON e.device_identifier = uie.device_identifier AND uie.swishjam_user_id = '#{@user_profile_id}'
            WHERE 
              e.swishjam_api_key = '#{@public_key}' AND
              e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              uie.swishjam_user_id = '#{@user_profile_id}' 
            ORDER BY e.occurred_at DESC
            LIMIT #{@limit}
          SQL
            #           JOIN (
            #   SELECT 
            #     device_identifier, 
            #     MAX(uie.occurred_at) AS max_occurred_at
            #   FROM user_identify_events AS uie
            #   WHERE swishjam_api_key = '#{@public_key}'
            #   GROUP BY uie.device_identifier
            # ) AS latest_identify_per_device ON e.device_identifier = latest_identify_per_device.device_identifier
            # LEFT JOIN user_identify_events AS uie ON 
            #             e.device_identifier = uie.device_identifier AND 
            #             latest_identify_per_device.max_occurred_at = uie.occurred_at
        end
      end
    end
  end
end