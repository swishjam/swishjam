module ClickHouseQueries
  module Users
    module Sessions
      class Timeseries
        include ClickHouseQueries::Helpers
        include TimeseriesHelper

        def initialize(public_key, user_profile_id, url_hosts: nil, url_host: nil, start_time: 6.months.ago, end_time: Time.current)
          raise ArgumentError, 'Must provide either url_host or url_hosts' if url_host.nil? && url_hosts.nil?
          @public_key = public_key
          @user_profile_id = user_profile_id
          @url_hosts = url_hosts || [url_host].compact
          @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
          @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        end

        def current_value
          timeseries.last[:value]
        end
        alias most_recent_value current_value

        def timeseries
          return @filled_in_results if defined?(@filled_in_results)
          formatted_results = Analytics::Event.find_by_sql(sql.squish!).collect do |event|
            { date: event.group_by_date, value: event.count }
          end
          
          @filled_in_results = []
          current_time = @start_time
          while current_time <= @end_time
            matching_result = formatted_results.find{ |result| result[:date].to_date == current_time }
            @filled_in_results << (matching_result || { date: current_time, value: 0 })
            current_time += 1.send(@group_by)
          end
          @filled_in_results
        end

        def sql
          url_host_filter = @url_hosts.any? ? " AND url_host IN (#{@url_hosts.map{ |host| "'#{host}'" }.join(', ')})" : ''
          <<~SQL
            SELECT
              CAST(COUNT(DISTINCT session_identifier) AS int) AS count,
              DATE_TRUNC('#{@group_by}', occurred_at) AS group_by_date
            FROM events
            JOIN (
              SELECT 
                device_identifier,
                MAX(
                  CASE
                    WHEN occurred_at IS NOT NULL
                    THEN occurred_at
                    ELSE NULL
                  END
                ) AS occurred_at
              FROM user_identify_events
              WHERE swishjam_user_id = '#{@user_profile_id}'
              GROUP BY device_identifier
            ) AS users_identify_events ON users_identify_events.device_identifier = events.device_identifier
            WHERE
              swishjam_api_key = '#{@public_key}' AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              name = '#{Analytics::Event::ReservedNames.NEW_SESSION}'
              #{url_host_filter}
            GROUP BY group_by_date
            ORDER BY group_by_date
          SQL
        end
      end
    end
  end
end