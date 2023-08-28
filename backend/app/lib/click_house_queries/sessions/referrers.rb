module ClickHouseQueries
  module Sessions
    class Referrers
      include ClickHouseQueries::Helpers

      def initialize(public_key, limit: 10, start_time: 6.months.ago, end_time: Time.current)
        @public_key = public_key
        @start_time = start_time
        @end_time = end_time
        @limit = limit
      end

      def by_full_url
        return @full_url_results if @full_url_results.present?
        @full_url_results = Analytics::Event.find_by_sql(sql.squish!).collect do |event|
          { referrer: event.referrer_url_host + event.referrer_url_path, count: event.count }
        end
      end

      def by_host
        return @host_results if @host_results.present?
        @host_results = Analytics::Event.find_by_sql(sql(by_url_host: true).squish!).collect do |event|
          { referrer: event.referrer_url_host, count: event.count }
        end
      end

      def sql(by_url_host: false)
        <<~SQL
          SELECT 
            CAST(COUNT(*) AS int) AS count,
            JSONExtractString(e.properties, 'referrer_url_host') AS referrer_url_host#{by_url_host ? ' ' : ', '}
            #{by_url_host ? '' : "JSONExtractString(e.properties, 'referrer_url_path') AS referrer_url_path"}
          FROM events e
          JOIN (
            SELECT 
              JSONExtractString(events.properties, '#{Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER}') AS session_identifier,
              MIN(occurred_at) AS occurred_at
            FROM events
            WHERE name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}'
            GROUP BY session_identifier
          ) AS first_page_views ON 
            first_page_views.session_identifier = JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER}') AND 
            first_page_views.occurred_at = e.occurred_at
          WHERE
            e.swishjam_api_key = '#{@public_key}' AND
            e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
          GROUP BY
            #{by_url_host ? 'referrer_url_host' : 'referrer_url_host, referrer_url_path'}
          ORDER BY
            count DESC
          LIMIT #{@limit}
        SQL
      end
    end
  end
end