module ClickHouseQueries
  module Sessions
    module Referrers
      class List
        include ClickHouseQueries::Helpers

        def initialize(public_keys, limit: 10, start_time: 6.months.ago, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @start_time = start_time
          @end_time = end_time
          @limit = limit
        end

        def by_full_url
          return @full_url_results if @full_url_results.present?
          @full_url_results = Analytics::Event.find_by_sql(sql.squish!).collect do |event|
            { referrer: (event.referrer_url_host || '') + (event.referrer_url_path || ''), count: event.count }
          end
        end

        def by_host
          return @host_results if @host_results.present?
          @host_results = Analytics::Event.find_by_sql(sql(by_url_host: true).squish!).collect do |event|
            { referrer: event.referrer_url_host || '', count: event.count }
          end
        end

        def sql(by_url_host: false)
          <<~SQL
            SELECT
              CAST(COUNT(*) AS int) AS count,
              domain(JSONExtractString(properties, 'referrer')) AS referrer_url_host
              #{by_url_host ? '' : ", path(JSONExtractString(properties, 'referrer')) AS referrer_url_path"}
            FROM events
            WHERE
              swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              name = '#{Analytics::Event::ReservedNames.NEW_SESSION}' AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
            GROUP BY referrer_url_host#{by_url_host ? '' : ', referrer_url_path'}
            ORDER BY count DESC
            LIMIT #{@limit}
          SQL
        end
      end
    end
  end
end