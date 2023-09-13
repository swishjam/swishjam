module ClickHouseQueries
  module Sessions
    module Browsers
      class List
        include ClickHouseQueries::Helpers

        def initialize(public_key, analytics_family:, limit: 10, start_time: 6.months.ago, end_time: Time.current)
          @public_key = public_key
          @analytics_family = analytics_family
          @start_time = start_time
          @end_time = end_time
          @limit = limit
        end

        def get
          return @full_url_results if @full_url_results.present?
          @full_url_results = Analytics::Event.find_by_sql(sql.squish!)
        end

        def sql(by_url_host: false)
          <<~SQL
            SELECT
              CAST(COUNT(*) AS int) AS count,
              JSONExtractString(properties, 'browser_name') AS browser_name
            FROM events AS sessions
            JOIN (
              SELECT 
                JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER}') AS session_identifier,
                analytics_family,
              FROM events
              WHERE name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}'
            ) AS page_views ON JSONExtractString(sessions.properties, '#{Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER}') = page_views.session_identifier
            WHERE
              sessions.swishjam_api_key = '#{@public_key}' AND
              sessions.name = '#{Analytics::Event::ReservedNames.NEW_SESSION}' AND
              sessions.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              page_views.analytics_family = '#{@analytics_family}' AND
              browser_name IS NOT NULL AND
              browser_name != ''
            GROUP BY browser_name
            ORDER BY count DESC
            LIMIT #{@limit}
          SQL
        end
      end
    end
  end
end