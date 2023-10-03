module ClickHouseQueries
  module Users
    module PageViews
      module MostVisited
        class List
          include ClickHouseQueries::Helpers

          def initialize(public_key, user_profile_id:, start_time: 6.months.ago, end_time: Time.current, limit: 10)
            @public_key = public_key
            @user_profile_id = user_profile_id
            @start_time = start_time
            @end_time = end_time
            @limit = limit
          end

          def get
            Analytics::Event.find_by_sql(sql.squish!).collect do |event|
              { url: event.url_host + event.url_path, url_host: event.url_host, url_path: event.url_path, count: event.count }
            end
          end

          def sql
            <<~SQL
              SELECT 
                CAST(COUNT() AS int) AS count,
                domain(JSONExtractString(e.properties, 'url')) AS url_host,
                path(JSONExtractString(e.properties, 'url')) AS url_path
              FROM events AS e
              JOIN (
                SELECT
                  device_identifier,
                  argMax(swishjam_user_id, occurred_at) AS swishjam_user_id
                FROM user_identify_events AS uie
                WHERE swishjam_api_key in #{formatted_in_clause(@public_key)}
                GROUP BY device_identifier
              ) AS uie ON 
                JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER}') = uie.device_identifier AND 
                uie.swishjam_user_id = '#{@user_profile_id}'
              WHERE 
                e.swishjam_api_key in #{formatted_in_clause(@public_key)} AND
                e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
                e.name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}' AND
                uie.swishjam_user_id = '#{@user_profile_id}' 
              GROUP BY url_host, url_path
              ORDER BY count DESC
              LIMIT #{@limit}
            SQL
          end
        end
      end
    end
  end
end