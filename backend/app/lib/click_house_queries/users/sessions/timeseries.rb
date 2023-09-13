module ClickHouseQueries
  module Users
    module Sessions
      class Timeseries
        include ClickHouseQueries::Helpers
        include TimeseriesHelper

        def initialize(public_key, user_profile_id, analytics_family:, start_time: 6.months.ago, end_time: Time.current)
          @public_key = public_key
          @user_profile_id = user_profile_id
          @analytics_family = analytics_family
          @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
          @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        end

        def timeseries
          return @filled_in_results if defined?(@filled_in_results)
          data = Analytics::Event.find_by_sql(sql.squish!)
          DataFormatters::Timeseries.new(
            data, 
            group_by: @group_by, 
            start_time: @start_time, 
            end_time: @end_time,
            value_method: :count,
            date_method: :group_by_date
          )
        end

        def sql
          <<~SQL
            SELECT
              CAST(COUNT(DISTINCT JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER}')) AS int) AS count,
              DATE_TRUNC('#{@group_by}', e.occurred_at) AS group_by_date
            FROM events AS e
            JOIN (
              SELECT
                device_identifier,
                argMax(swishjam_user_id, occurred_at) AS swishjam_user_id
              FROM user_identify_events AS uie
              WHERE swishjam_api_key = '#{@public_key}'
              GROUP BY device_identifier
            ) AS uie ON 
              JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER}') = uie.device_identifier AND 
              uie.swishjam_user_id = '#{@user_profile_id}'
            WHERE
              e.swishjam_api_key = '#{@public_key}' AND
              e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              e.name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}' AND
              uie.swishjam_user_id = '#{@user_profile_id}' AND
              e.analytics_family = '#{@analytics_family}'
            GROUP BY group_by_date
            ORDER BY group_by_date
          SQL
        end
      end
    end
  end
end