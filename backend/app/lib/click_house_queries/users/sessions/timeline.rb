module ClickHouseQueries
  module Users
    module Sessions
      class Timeline
        include ClickHouseQueries::Helpers
        
        def initialize(public_keys, user_profile_id:, start_time: 6.months.ago, end_time: Time.current, limit: 5)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @user_profile_id = user_profile_id
          @start_time = start_time
          @end_time = end_time
          @limit = limit
        end

        def get
          raw_timeline = Analytics::Event.find_by_sql(sql.squish!)
          byebug
          raw_timeline.map do |session|
            {
              id: session.session_identifier,
              properties: JSON.parse(session.session_properties),
              occurred_at: session.occurred_at,
              events: session.page_views.map do |event_arr|
                {
                  name: event_arr[0],
                  properties: JSON.parse(event_arr[1]),
                  occurred_at: event_arr[2],
                }
              end
            }
          end
        end

        def sql
          # TODO: I don't think this is nesting events within page views correctly
          <<~SQL
            SELECT 
              sessions.session_identifier AS session_identifier,
              sessions.properties AS session_properties,
              sessions.occurred_at AS occurred_at,
              groupArray((page_views.page_view_identifier, page_views.url, page_views.occurred_at)) AS page_views
            FROM (
              SELECT
                JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER}') AS session_identifier,
                name,
                properties,
                occurred_at
              FROM events
              WHERE
                swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
                occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
                name = '#{Analytics::Event::ReservedNames.NEW_SESSION}'
            ) AS sessions
            LEFT JOIN (
              SELECT
                JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER}') AS session_identifier,
                JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.PAGE_VIEW_IDENTIFIER}') AS page_view_identifier,
                JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.URL}') AS url,
                occurred_at,
                groupArray((events.name, events.properties, events.occurred_at)) AS events
              FROM events AS pv
              LEFT JOIN (
                SELECT
                  JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.PAGE_VIEW_IDENTIFIER}') AS page_view_identifier,
                  name,
                  properties,
                  occurred_at
                FROM events
                WHERE
                  swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
                  occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
              ) AS events ON events.page_view_identifier = JSONExtractString(pv.properties, '#{Analytics::Event::ReservedPropertyNames.PAGE_VIEW_IDENTIFIER}')
              WHERE
                pv.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
                pv.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
                pv.name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}'
              GROUP BY session_identifier, page_view_identifier, url, occurred_at
            ) AS page_views ON page_views.session_identifier = sessions.session_identifier
            JOIN (
              SELECT
                device_identifier,
                argMax(swishjam_user_id, occurred_at) AS swishjam_user_id
              FROM user_identify_events AS uie
              WHERE swishjam_api_key in #{formatted_in_clause(@public_keys)}
              GROUP BY device_identifier
            ) AS uie ON 
              JSONExtractString(sessions.properties, '#{Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER}') = uie.device_identifier AND 
              uie.swishjam_user_id = '#{@user_profile_id}'
            GROUP BY sessions.session_identifier, sessions.properties, sessions.occurred_at
            LIMIT #{@limit}
          SQL
        end
      end
    end
  end
end