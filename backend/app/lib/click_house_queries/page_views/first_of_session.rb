module ClickHouseQueries
  module PageViews
    class FirstOfSession
      extend ClickHouseQueries::Helpers

      def self.get(public_key, start_time, end_time)
        sql = self.sql(public_key, start_time, end_time)
        Analytics::Event.find_by_sql(sql)
      end

      def self.sql(public_key, start_time, end_time)
        <<~SQL
          SELECT e.*
          FROM events e
          JOIN (
            SELECT
              session_identifier,
              MIN(occurred_at) AS occurred_at
            FROM
              events
            WHERE
              events.swishjam_api_key = '#{public_key}' AND
              events.name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}' AND
              events.occurred_at BETWEEN '#{formatted_time(start_time)}' AND '#{formatted_time(end_time)}'
            GROUP BY
              session_identifier
          ) AS first_page_views ON 
            first_page_views.session_identifier = e.session_identifier AND 
            first_page_views.occurred_at = e.occurred_at
        SQL
      end
    end
  end
end