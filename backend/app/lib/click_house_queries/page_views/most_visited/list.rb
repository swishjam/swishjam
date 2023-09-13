module ClickHouseQueries
  module PageViews
    module MostVisited
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
          Analytics::Event.find_by_sql(sql.squish!).collect do |event|
            { url: event.url_host + event.url_path, url_host: event.url_host, url_path: event.url_path, count: event.count }
          end
        end

        def sql
          <<~SQL
            SELECT
              CAST(COUNT(*) AS int) AS count,
              domain(JSONExtractString(properties, 'url')) AS url_host,
              path(JSONExtractString(properties, 'url')) AS url_path
            FROM events
            WHERE
              swishjam_api_key = '#{@public_key}' AND
              name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}' AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              analytics_family = '#{@analytics_family}'
            GROUP BY url_host, url_path
            ORDER BY count DESC
            LIMIT #{@limit}
          SQL
        end
      end
    end
  end
end