module ClickHouseQueries
  module Organizations
    module Events
      class All
        include ClickHouseQueries::Helpers
        
        def initialize(public_key, organization_profile_id:, limit: 10, start_time: 6.months.ago, end_time: Time.current)
          @public_key = public_key
          @organization_profile_id = organization_profile_id
          @limit = limit
          @start_time = start_time
          @end_time = end_time
        end

        def get
          Analytics::Event.find_by_sql(sql)
        end

        def sql
          url_host_filter = @url_hosts.any? ? " AND e.url_host IN (#{@url_hosts.map{ |host| "'#{host}'" }.join(', ')})" : ''
          <<~SQL
            SELECT 
              e.uuid AS uuid,
              e.swishjam_api_key AS swishjam_api_key,
              e.name AS name, 
              e.properties AS properties, 
              device_identifier AS device_identifier,
              e.occurred_at AS occurred_at, 
              e.ingested_at AS ingested_at
            FROM events AS e
            JOIN (
              SELECT
                DISTINCT(session_identifier) AS session_identifier,
                swishjam_organization_id
              FROM events
              WHERE swishjam_organization_id = '#{@organization_profile_id}'
              GROUP BY swishjam_organization_id
            ) AS orgs_sessions ON e.session_identifier = orgs_sessions.session_identifier
            WHERE 
              e.swishjam_api_key = '#{@public_key}' AND
              e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
              #{url_host_filter}
            ORDER BY e.occurred_at DESC
            LIMIT #{@limit}
          SQL
        end
      end
    end
  end
end