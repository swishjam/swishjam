module ClickHouseQueries
  module Users
    module Active
      class Count

        include ClickHouseQueries::Helpers

        def initialize(public_keys, start_time:, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @start_time = start_time 
          @end_time = end_time 
          # later us  
          #@start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: self.class.sql_date_trunc_unit)
        end

        def count 
          raw_results = Analytics::Event.find_by_sql(sql.squish!)
          raw_results.first.num_unique_users 
        end

        def sql
          <<~SQL
            SELECT 
              CAST(COUNT(DISTINCT
                IF(
                  identify.swishjam_user_id IS NOT NULL AND identify.swishjam_user_id != '', 
                  identify.swishjam_user_id, 
                  JSONExtractString(events.properties, '#{Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER}')
                )
              ) AS int) AS num_unique_users
            FROM events
            LEFT JOIN (
              SELECT
                device_identifier,
                MAX(occurred_at) AS max_occurred_at,
                argMax(swishjam_user_id, occurred_at) AS swishjam_user_id
              FROM user_identify_events AS uie
              WHERE swishjam_api_key IN #{formatted_in_clause(@public_keys)}
              GROUP BY device_identifier
            ) AS identify ON identify.device_identifier = JSONExtractString(events.properties, '#{Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER}')
            WHERE
              events.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              events.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
          SQL
        end

      end
    end
  end
end