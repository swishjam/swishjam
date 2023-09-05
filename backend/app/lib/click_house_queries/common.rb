module ClickHouseQueries
  class Common
    class << self
      def most_recent_identify_join(api_key:, events_table: 'e', user_identify_table: 'uie')
        <<~SQL
          JOIN (
            SELECT 
              device_identifier, 
              MAX(uie.occurred_at) AS max_occurred_at
            FROM user_identify_events AS uie
            WHERE swishjam_api_key = '#{api_key}'
            GROUP BY uie.device_identifier
          ) AS latest_identify_per_device ON #{events_table}.device_identifier = latest_identify_per_device.device_identifier
          JOIN user_identify_events AS #{user_identify_table} ON 
            #{events_table}.device_identifier = #{user_identify_table}.device_identifier AND 
            latest_identify_per_device.max_occurred_at = #{user_identify_table}.occurred_at
        SQL
      end
    end
  end
end