module ClickHouseQueries
  module Organizations
    module PageViews
      class Counts
        include ClickHouseQueries::Helpers

        def initialize(public_key, organization_profile_id:, url_hosts: nil, url_host: nil, limit: 10, start_time: 6.months.ago, end_time: Time.current)
          raise ArgumentError, 'url_hosts or url_host must be provided' if url_hosts.nil? && url_host.nil?
          @public_key = public_key
          @organization_profile_id = organization_profile_id
          @url_hosts = url_hosts || [url_host].compact
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
          url_hosts_filter = @url_hosts.any? ? " AND e.url_host IN (#{@url_hosts.map{ |host| "'#{host}'" }.join(', ')})" : ''
          <<~SQL
            SELECT
              CAST(COUNT(*) AS int) AS count,
              e.url_host AS url_host,
              e.url_path AS url_path
            FROM events AS e
            JOIN (
              SELECT DISTINCT session_identifier AS session_identifier
              FROM events
              WHERE swishjam_organization_id = '#{@organization_profile_id}'
            ) AS org_sessions ON org_sessions.session_identifier = e.session_identifier
            WHERE
              e.swishjam_api_key = '#{@public_key}' AND
              e.name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}' AND
              e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
              #{url_hosts_filter}
            GROUP BY url_host, url_path
            ORDER BY count DESC
            LIMIT #{@limit}
          SQL
        end
      end
    end
  end
end