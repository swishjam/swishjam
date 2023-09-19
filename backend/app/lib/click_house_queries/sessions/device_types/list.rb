module ClickHouseQueries
  module Sessions
    module DeviceTypes
      class List
        include ClickHouseQueries::Helpers

        def initialize(public_key, analytics_family:, start_time: 6.months.ago, end_time: Time.current)
          @public_key = public_key
          @analytics_family = analytics_family
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
              swishjam_api_key = '#{@public_key}' AND
              name = '#{Analytics::Event::ReservedNames.NEW_SESSION}' AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              analytics_family = '#{@analytics_family}' AND
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