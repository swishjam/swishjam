module ClickHouseQueries
  module Event
    module TopUsers
      class Timeseries
        include ClickHouseQueries::Helpers
        include TimeseriesHelper

        def initialize(public_keys, event_name:, limit: 10, start_time: 6.months.ago, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @event_name = event_name
          @limit = limit
          @start_time = start_time
          @end_time = end_time
          @group_by = derived_group_by(start_ts: @start_time, end_ts: @end_time)
        end

        def get
          return @data if @data.present?
          raw_data = Analytics::Event.find_by_sql(sql.squish!)
          byebug
          user_ids = raw_data.find_all{ |raw| !raw.is_anonymous }.collect(&:device_identifier_or_swishjam_user_id)
          users = AnalyticsUserProfile.where(id: user_ids)
          @data = raw_data.map do |raw|
            if raw.is_anonymous
              {
                device_identifier: raw.device_identifier_or_swishjam_user_id,
                count: raw.count,
                is_anonymous: true,
              }
            else
              user = users.find { |u| u.id == raw.device_identifier_or_swishjam_user_id }
              {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                full_name: user.full_name,
                count: raw.count,
                is_anonymous: false,
              }
            end
          end
        end

        def sql
          <<~SQL
            SELECT 
              IF (
                identify.swishjam_user_id = '', 
                JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER}'),
                identify.swishjam_user_id
              ) AS device_identifier_or_swishjam_user_id,
              IF (identify.swishjam_user_id = '', true, false) AS is_anonymous,
              DATE_TRUNC('#{@group_by}', e.occurred_at) AS date,
              COUNT() as count
            FROM events AS e
            LEFT JOIN (
              SELECT
                device_identifier,
                MAX(occurred_at) AS max_occurred_at,
                argMax(swishjam_user_id, occurred_at) AS swishjam_user_id
              FROM user_identify_events AS uie
              WHERE swishjam_api_key IN #{formatted_in_clause(@public_keys)}
              GROUP BY device_identifier
            ) AS identify ON identify.device_identifier = JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER}')
            WHERE
              e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              e.name = '#{@event_name}' AND
              e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
            GROUP BY device_identifier_or_swishjam_user_id, is_anonymous, date
            ORDER BY count DESC
            LIMIT #{@limit}
          SQL
        end
      end
    end
  end
end