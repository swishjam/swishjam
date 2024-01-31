class NewEventsSchema < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      CREATE TABLE new_events (
        `uuid` String,
        `swishjam_api_key` LowCardinality(String),
        `name` LowCardinality(String),
        `user_profile_id` Nullable(String),
        `organization_profile_id` Nullable(String),
        `properties` String,
        `user_properties` String,
        `ingested_at` DateTime64(3, 'UTC') DEFAULT now(),
        `occurred_at` DateTime64(3, 'UTC'),
      )
      ENGINE = ReplacingMergeTree(ingested_at)
      ORDER BY (swishjam_api_key, name, occurred_at, uuid)
      PRIMARY KEY (swishjam_api_key, name, occurred_at)
    SQL

    execute <<~SQL
      INSERT INTO new_events (uuid, swishjam_api_key, name, user_profile_id, properties, user_properties, ingested_at, occurred_at)
      SELECT 
        e.uuid AS uuid, 
        e.swishjam_api_key AS swishjam_api_key, 
        name, 
        IF(
          empty(JSONExtractString(e.properties, 'user_profile_id')),
          user_profiles.swishjam_user_id, 
          JSONExtractString(e.properties, 'user_profile_id')
        ) AS user_profile_id,
        e.properties AS properties, 
        IF(
          empty(user_profiles.swishjam_user_id),
          '{}',
          concat(
            '{ "unique_identifier":  "', 
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
            substring(user_profiles.metadata, 2, length(user_profiles.metadata) - 2),
            '}'
          )
        ) AS user_properties, 
        e.ingested_at AS ingested_at, 
        e.occurred_at AS occurred_at
      FROM events AS e
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
          argMax(metadata, updated_at) AS metadata
        FROM swishjam_user_profiles
        GROUP BY swishjam_user_id
      ) as user_profiles ON user_profiles.swishjam_user_id = identify.swishjam_user_id OR
        user_profiles.swishjam_user_id = JSONExtractString(e.properties, 'user_profile_id')
    SQL

    execute('DROP TABLE events')
    execute('RENAME TABLE new_events TO events')
  end

  def down
    # raise ActiveRecord::IrreversibleMigration
    execute('DROP TABLE events')
    # old schema? 
    execute <<~SQL
      CREATE TABLE events (
        `uuid` String,
        `swishjam_api_key` LowCardinality(String),
        `name` LowCardinality(String),
        `ingested_at` DateTime DEFAULT now(),
        `occurred_at` DateTime,
        `properties` String,
      )
      ENGINE = MergeTree()
      ORDER BY (swishjam_api_key, name, occurred_at)
    SQL
  end
end
