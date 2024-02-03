module DataMigrators
  class MoveOldEventsDataIntoEventsTableWithNewFields
    def self.run!
      sql = <<~SQL
        INSERT INTO events (
          uuid, 
          swishjam_api_key, 
          name, 
          user_profile_id, 
          organization_profile_id, 
          properties, 
          user_properties, 
          organization_properties, 
          ingested_at, 
          occurred_at
        )
        SELECT 
          e.uuid AS uuid, 
          e.swishjam_api_key AS swishjam_api_key, 
          e.name AS name, 
          IF(
            empty(JSONExtractString(e.properties, 'user_profile_id')),
            IF(
              empty(user_profiles.swishjam_user_id), 
              NULL,
              user_profiles.swishjam_user_id
            ),
            IF (
              empty(JSONExtractString(e.properties, 'user_profile_id')),
              NULL,
              JSONExtractString(e.properties, 'user_profile_id')
            )
          ) AS user_profile_id,
          IF( 
            empty(organization_profiles.swishjam_organization_id),
            NULL,
            organization_profiles.swishjam_organization_id
          ) AS organization_profile_id,
          e.properties AS properties,
          IF(
            empty(user_profiles.swishjam_user_id),
            IF(
              empty(JSONExtractString(e.properties, 'user_attributes')),
              '{}',
              JSONExtractString(e.properties, 'user_attributes')
            ),
            concat(
              '{ "unique_identifier": "', 
              user_profiles.user_unique_identifier, 
              '",',
              '"email": "', 
              user_profiles.email, 
              '",',
              '"first_name": "', 
              user_profiles.first_name, 
              '",',
              '"last_name": "', 
              user_profiles.last_name, 
              '",',
              '"initial_landing_page_url": "',
              user_profiles.initial_landing_page_url,
              '",',
              '"initial_referrer_url": "',
              user_profiles.initial_referrer_url,
              '",',
              substring(user_profiles.metadata, 2, length(user_profiles.metadata) - 2),
              '}'
            )
          ) AS user_properties, 
          IF (
            empty(organization_profiles.swishjam_organization_id),
            '{}',
            concat(
              '{ "unique_identifier": "',
              organization_profiles.organization_unique_identifier,
              '",',
              '"name": "',
              organization_profiles.name,
              '" }'
            )
          ) AS organization_properties,
          e.ingested_at AS ingested_at, 
          e.occurred_at AS occurred_at
        FROM old_events AS e
        LEFT JOIN (
          SELECT
            device_identifier,
            argMax(swishjam_api_key, occurred_at) AS swishjam_api_key,
            MAX(occurred_at) AS max_occurred_at,
            argMax(swishjam_user_id, occurred_at) AS swishjam_user_id
          FROM user_identify_events AS uie
          GROUP BY device_identifier
        ) AS identify ON 
          identify.device_identifier = JSONExtractString(e.properties, 'device_identifier') AND
          identify.swishjam_api_key = e.swishjam_api_key
        LEFT JOIN (
          SELECT
            swishjam_user_id,
            argMax(user_unique_identifier, updated_at) AS user_unique_identifier,
            argMax(email, updated_at) AS email,
            argMax(first_name, updated_at) AS first_name,
            argMax(last_name, updated_at) AS last_name,
            argMax(initial_landing_page_url, updated_at) AS initial_landing_page_url,
            argMax(initial_referrer_url, updated_at) AS initial_referrer_url,
            argMax(metadata, updated_at) AS metadata
          FROM old_swishjam_user_profiles
          GROUP BY swishjam_user_id
        ) as user_profiles ON user_profiles.swishjam_user_id = identify.swishjam_user_id OR
          user_profiles.swishjam_user_id = JSONExtractString(e.properties, 'user_profile_id')
        LEFT JOIN (
          SELECT
            swishjam_organization_id,
            argMax(organization_unique_identifier, updated_at) AS organization_unique_identifier,
            argMax(name, updated_at) AS name,
            argMax(metadata, updated_at) AS metadata
          FROM old_swishjam_organization_profiles
          GROUP BY swishjam_organization_id
        ) as organization_profiles ON organization_profiles.swishjam_organization_id = JSONExtractString(JSONExtractString(e.properties, 'organization_attributes'), 'organization_identifier')
      SQL
      puts "Migrating old events table into new events with filled in fields...".colorize(:yellow)
      Analytics::ClickHouseRecord.execute_sql(sql)
    end
  end
end