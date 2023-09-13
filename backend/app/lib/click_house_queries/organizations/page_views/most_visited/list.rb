module ClickHouseQueries
  module Organizations
    module PageViews
      module MostVisited
        class List
          include ClickHouseQueries::Helpers

          def initialize(public_key, organization_profile_id:, analytics_family:, limit: 10, start_time: 6.months.ago, end_time: Time.current)
            @public_key = public_key
            @organization_profile_id = organization_profile_id
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
                CAST(COUNT(*) AS int) AS count,
                domain(JSONExtractString(e.properties, 'url')) AS url_host,
                path(JSONExtractString(e.properties, 'url')) AS url_path
              FROM events AS e
              JOIN (
                SELECT DISTINCT session_identifier AS session_identifier
                FROM organization_identify_events
                WHERE 
                  swishjam_organization_id = '#{@organization_profile_id}' AND
                  swishjam_api_key = '#{@public_key}'
              ) AS oie ON oie.session_identifier = JSONExtractString(e.properties, 'session_identifier')
              WHERE
                e.swishjam_api_key = '#{@public_key}' AND
                e.name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}' AND
                e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
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