module ClickHouseQueries
  module Sessions
    class Browsers
      include ClickHouseQueries::Helpers

      def initialize(public_key, limit: 10, start_time: 6.months.ago, end_time: Time.current)
        @public_key = public_key
        @start_time = start_time
        @end_time = end_time
        @limit = limit
      end

      def get
        return @formatted_results if @formatted_results.present?
        @formatted_results = {}
        Analytics::Event.find_by_sql(sql.squish!).each do |event|
          @formatted_results[event.browser] = event.count
        end
        @formatted_results
      end

      def sql
        <<~SQL
          SELECT 
            CAST(COUNT(*) AS int) AS count,
            JSONExtractString(events.properties, 'browser') AS browser
          FROM events e
          JOIN (
            SELECT session_identifier, MIN(occurred_at) AS occurred_at
            FROM events
            WHERE name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}'
            GROUP BY session_identifier
          ) AS first_page_views ON 
            first_page_views.session_identifier = e.session_identifier AND 
            first_page_views.occurred_at = e.occurred_at
          WHERE
            e.swishjam_api_key = '#{@public_key}' AND
            e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
          GROUP BY
            browser
        SQL
      end

    end
  end
end