module ClickHouseQueries
  module Sessions
    module Browsers
      class List
        include ClickHouseQueries::Helpers

        def initialize(public_keys, limit: 10, start_time: 6.months.ago, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @start_time = start_time
          @end_time = end_time
          @limit = limit
        end

        def get
          return @full_url_results if @full_url_results.present?
          @full_url_results = Analytics::Event.find_by_sql(sql.squish!)
        end

        def sql(by_url_host: false)
          <<~SQL
            SELECT
              CAST(COUNT(*) AS int) AS count,
              JSONExtractString(properties, 'browser_name') AS browser_name
            FROM events
            WHERE
              swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              name = '#{Analytics::Event::ReservedNames.NEW_SESSION}' AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              browser_name IS NOT NULL AND
              browser_name != ''
            GROUP BY browser_name
            ORDER BY count DESC
            LIMIT #{@limit}
          SQL
        end
      end
    end
  end
end