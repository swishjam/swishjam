module DataMigrators
  class UserIdentifiesToAnalyticsUserProfileDevices
    def self.run!
      ActiveRecord::Base.logger.silence do
        start = Time.current
        case_statement = ApiKey.all.pluck(:public_key, :workspace_id).to_h.map do |public_key, workspace_id|
          "WHEN '#{public_key}' THEN '#{workspace_id}'"
        end.join(' ')

        sql = <<~SQL
          SELECT 
            device_identifier AS swishjam_cookie_value,
            argMax(swishjam_user_id, uie.occurred_at) AS analytics_user_profile_id,
            CASE argMax(swishjam_api_key, uie.occurred_at)
              #{case_statement}
              ELSE NULL
            END AS workspace_id,
            MAX(uie.occurred_at) AS created_at,
            MAX(uie.occurred_at) AS updated_at
          FROM user_identify_events AS uie
          GROUP BY swishjam_cookie_value
        SQL
        
        devices_to_insert = Analytics::ClickHouseRecord.execute_sql(sql)
        if devices_to_insert.empty?
          puts "No `user_identify_events` records to migrate!".colorize(:green)
          return
        end
        
        puts "Inserting every `user_identify_events` record into temporary `migrated_user_identify_events_TEMP` and flushing all data from the table...".colorize(:yellow)
        Analytics::ClickHouseRecord.execute_sql("INSERT INTO migrated_user_identify_events_TEMP SELECT * FROM user_identify_events", format: nil)
        Analytics::ClickHouseRecord.execute_sql('TRUNCATE TABLE user_identify_events', format: nil)
        
        puts "Inserting #{devices_to_insert.count} `analytics_user_profile_devices` into Postgres...".colorize(:yellow)
        AnalyticsUserProfileDevice.insert_all!(devices_to_insert)

        puts "Success!".colorize(:green)
        puts "Took #{Time.current - start} seconds".colorize(:grey)
      end
    end
  end
end