module ClickHouseQueries
  module Organizations
    module PageViews
      module MostVisited
        class List
          include ClickHouseQueries::Helpers

          def initialize(public_keys, organization_unique_identifier:, limit: 10, start_time: 6.months.ago, end_time: Time.current)
            @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
            @organization_unique_identifier = organization_unique_identifier
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
                CAST(COUNT(DISTINCT JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.PAGE_VIEW_IDENTIFIER}')) AS int) AS count,
                domain(JSONExtractString(e.properties, 'url')) AS url_host,
                path(JSONExtractString(e.properties, 'url')) AS url_path
              FROM events AS e
              WHERE
                e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
                e.name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}' AND
                e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
                JSONExtractString(JSONExtractString(e.properties, 'organization_attributes'), 'organization_identifier') = '#{@organization_unique_identifier}'
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