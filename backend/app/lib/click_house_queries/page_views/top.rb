module ClickHouseQueries
  module PageViews
    class Top
      include ClickHouseQueries::Helpers

      def initialize(public_key, url_host: nil, url_hosts: nil, limit: 10, start_time: 6.months.ago, end_time: Time.current)
        raise ArgumentError, 'url_host or url_hosts must be provided' if url_host.nil? && url_hosts.nil?
        @url_hosts = url_hosts || [url_host].compact
        @public_key = public_key
        @start_time = start_time
        @end_time = end_time
        @limit = limit
      end

      def top
        Analytics::Event.find_by_sql(sql.squish!).collect do |event|
          { url: event.url_host + event.url_path, url_host: event.url_host, url_path: event.url_path, count: event.count }
        end
      end

      def sql
        <<~SQL
          SELECT
            CAST(COUNT(*) AS int) AS count,
            JSONExtractString(events.properties, 'url_host') AS url_host,
            JSONExtractString(events.properties, 'url_path') AS url_path
          FROM
            events
          WHERE
            swishjam_api_key = '#{@public_key}' AND
            name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}' AND
            events.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
            JSONExtractString(properties, 'url_host') IN (#{@url_hosts.map{ |host| "'#{host}'" }.join(', ')})
          GROUP BY url_host, url_path
          ORDER BY count DESC
          LIMIT #{@limit}
        SQL
      end
    end
  end
end