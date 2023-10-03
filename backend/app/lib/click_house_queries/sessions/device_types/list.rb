module ClickHouseQueries
  module Sessions
    module DeviceTypes
      class List
        include ClickHouseQueries::Helpers

        def initialize(public_keys, start_time: 6.months.ago, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @start_time = start_time
          @end_time = end_time
        end

        def get
          return @results if @results.present?
          @results = Analytics::Event.find_by_sql(sql.squish!).collect{ |e| { device_type: e.device_type, count: e.count }}
        end

        def sql(by_url_host: false)
          <<~SQL
            SELECT
              CAST(COUNT(*) AS int) AS count,
              CASE WHEN JSONExtractString(properties, 'is_mobile') = 'true' THEN 'mobile' ELSE 'desktop' END AS device_type
            FROM events
            WHERE
              swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              name = '#{Analytics::Event::ReservedNames.NEW_SESSION}' AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              device_type IS NOT NULL AND
              device_type != ''
            GROUP BY device_type
            ORDER BY count DESC
          SQL
        end
      end
    end
  end
end