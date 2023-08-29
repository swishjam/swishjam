module ClickHouseQueries
  module Sessions
    class FirstPageViewPropertyCount
      include ClickHouseQueries::Helpers

      def initialize(public_key, limit: 10, start_time: 6.months.ago, end_time: Time.current)
        @public_key = public_key
        @start_time = start_time
        @end_time = end_time
        @limit = limit
      end

      def get(property)
        @formatted_results = {}
        Analytics::Event.find_by_sql(sql(property).squish!).each do |event|
          @formatted_results[event.send(property)] = event.count
        end
        @formatted_results
      end

      def sql(property)
        <<~SQL
          SELECT 
            CAST(COUNT(*) AS int) AS count,
            JSONExtractString(e.properties, '#{property}') AS #{property}
          FROM events e
          JOIN (
            SELECT 
              JSONExtractString(events.properties, '#{Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER}') AS session_identifier, 
              MIN(occurred_at) AS occurred_at
            FROM events
            WHERE name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}'
            GROUP BY session_identifier
          ) AS first_page_views ON 
            first_page_views.session_identifier = JSONExtractString(events.properties, '#{Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER}') AND 
            first_page_views.occurred_at = e.occurred_at AND
            e.name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}'
          WHERE
            e.swishjam_api_key = '#{@public_key}' AND
            e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
            JSONExtractString(e.properties, '#{property}') != '' AND
            JSONExtractString(e.properties, '#{property}') IS NOT NULL
          GROUP BY
            #{property}
        SQL
      end

    end
  end
end