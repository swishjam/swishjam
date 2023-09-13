module ClickHouseQueries
  module Users
    module PageViews
      module MostVisited
        class List
          include ClickHouseQueries::Helpers

          def initialize(public_key, user_profile_id:, analytics_family:, start_time: 6.months.ago, end_time: Time.current, limit: 10)
            @public_key = public_key
            @user_profile_id = user_profile_id
            @analytics_family = analytics_family
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
                COUNT() AS count,
                domain(JSONExtractString(e.properties, 'url')) AS url_host,
                path(JSONExtractString(e.properties, 'url')) AS url_path
              FROM events AS e
              JOIN (
                SELECT
                  device_identifier,
                  argMax(swishjam_user_id, occurred_at) AS swishjam_user_id
                FROM user_identify_events AS uie
                WHERE swishjam_api_key = '#{@public_key}'
                GROUP BY device_identifier
              ) AS uie ON 
                JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER}') = uie.device_identifier AND 
                uie.swishjam_user_id = '#{@user_profile_id}'
              WHERE 
                e.swishjam_api_key = '#{@public_key}' AND
                e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
                e.name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}' AND
                uie.swishjam_user_id = '#{@user_profile_id}' 
              GROUP BY url_host, url_path
              ORDER BY count DESC
              LIMIT #{@limit}
            SQL
            # <<~SQL
            #   SELECT
            #     CAST(COUNT(page_views.uuid) AS int) AS count,
            #     domain(JSONExtractString(page_views.properties, 'url')) AS url_host,
            #     path(JSONExtractString(page_views.properties, 'url')) AS url_path
            #   FROM events AS page_views
            #   JOIN (
            #     SELECT
            #       device_identifier,
            #       argMax(swishjam_user_id, occurred_at) AS swishjam_user_id
            #     FROM user_identify_events AS uie
            #     WHERE  swishjam_api_key = '#{@public_key}'
            #     GROUP BY device_identifier
            #   ) AS uie ON 
            #     JSONExtractString(page_views.properties, '#{Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER}') = uie.device_identifier AND
            #     uie.swishjam_user_id = '#{@user_profile_id}'
            #   WHERE
            #     page_views.swishjam_api_key = '#{@public_key}' AND
            #     page_views.name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}' AND
            #     page_views.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
            #     uie.swishjam_user_id = '#{@user_profile_id}' AND
            #     page_views.analytics_family = '#{@analytics_family}'
            #   GROUP BY url_host, url_path
            #   ORDER BY count DESC
            #   LIMIT #{@limit}
            # SQL
          end
        end
      end
    end
  end
end