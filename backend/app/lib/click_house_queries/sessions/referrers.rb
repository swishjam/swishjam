module ClickHouseQueries
  module Sessions
    class Referrers
      include ClickHouseQueries::Helpers

      def initialize(public_key, url_host: nil, url_hosts: nil, limit: 10, start_time: 6.months.ago, end_time: Time.current)
        raise ArgumentError, 'Must provide either url_host or url_hosts' if url_host.nil? && url_hosts.nil?
        @url_hosts = url_hosts || [url_host].compact
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
        url_host_filter = @url_hosts.any? ? " AND url_host IN (#{@url_hosts.map{ |host| "'#{host}'" }.join(', ')})" : ''
        <<~SQL
          SELECT
            CAST(COUNT(*) AS int) AS count,
            referrer_url_host AS referrer_url_host
            #{by_url_host ? '' : ", referrer_url_path AS referrer_url_path"}
          FROM
            events AS e
          JOIN (
            SELECT uuid, url_host, url_path
            FROM events
            WHERE
              swishjam_api_key = '#{@public_key}' AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              name = '#{Analytics::Event::ReservedNames.NEW_SESSION}'
              #{url_host_filter}
          ) AS filtered_sessions ON filtered_sessions.uuid = e.uuid
          GROUP BY referrer_url_host#{by_url_host ? '' : ', referrer_url_path'}
          ORDER BY count DESC
          LIMIT #{@limit}
        SQL
      end
    end
  end
end