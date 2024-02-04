module DataMigrators
  class UserIdentifiesToAnalyticsUserProfileDevices
    def self.run!
      ActiveRecord::Base.logger.silence do
        start = Time.current

        junk_workspace = Workspace.create!(name: 'Junk Workspace for events with missing workspace_id')

        case_statement = ApiKey.all.pluck(:public_key, :workspace_id).to_h.map do |public_key, workspace_id|
          "WHEN '#{public_key}' THEN '#{workspace_id}'"
        end.join(' ')

        sql = <<~SQL
          SELECT 
            device_identifier AS swishjam_cookie_value,
            argMax(swishjam_user_id, uie.occurred_at) AS analytics_user_profile_id,
            CASE argMax(swishjam_api_key, uie.occurred_at)
              #{case_statement}
              ELSE '#{junk_workspace.id}'
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
        
        num_devices = devices_to_insert.count
        puts "Inserting #{num_devices} `analytics_user_profile_devices` into Postgres...".colorize(:yellow)
        devices_to_insert.each_with_index do |device_data, i|
          AnalyticsUserProfileDevice.insert!(device_data)
          puts "#{i + 1}/#{num_devices} inserted (#{(i + 1.0) / num_devices}%)".colorize(:yellow)
        rescue => e
          puts "Error inserting device: #{device_data.inspect} for workspace #{workspace.id}: #{e.message}".colorize(:red)
        end

        puts "Success!".colorize(:green)
        puts "Took #{Time.current - start} seconds".colorize(:grey)
      end
    end
  end
end