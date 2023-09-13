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
          return @full_url_results if @full_url_results.present?
          @full_url_results = Analytics::Event.find_by_sql(sql.squish!)
        end

        def sql(by_url_host: false)
          # IF(JSONExtractString(properties, 'is_mobile') = 1, 'mobile', 'desktop')  AS device_type
          <<~SQL
            SELECT
              CAST(COUNT(*) AS int) AS count,
              JSONExtractString(properties, 'device_type') AS device_type
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