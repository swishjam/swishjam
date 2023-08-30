module ClickHouseQueries
  module Sessions
    class ByNewSessionPropertyCount
      include ClickHouseQueries::Helpers

      def initialize(public_key, url_host: nil, url_hosts: nil, limit: 10, start_time: 6.months.ago, end_time: Time.current)
        raise ArgumentError, 'Must provide either url_host or url_hosts' if url_host.nil? && url_hosts.nil?
        @url_hosts = url_hosts || [url_host].compact
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
          FROM events AS e
          JOIN (
            SELECT
              uuid,
              JSONExtractString(properties, 'url_host') AS url_host,
              JSONExtractString(properties, 'url_path') AS url_path
            FROM
              events
            WHERE
              swishjam_api_key = '#{@public_key}' AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              name = '#{Analytics::Event::ReservedNames.NEW_SESSION}' AND
              JSONExtractString(properties, 'url_host') IN (#{@url_hosts.map{ |host| "'#{host}'" }.join(', ')}) AND
              JSONExtractString(properties, '#{property}') != '' AND
              JSONExtractString(properties, '#{property}') IS NOT NULL
          ) AS filtered_sessions ON filtered_sessions.uuid = e.uuid
          GROUP BY #{property}
          ORDER BY count DESC
          LIMIT #{@limit}
        SQL
      end

    end
  end
end