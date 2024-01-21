class NewEventsSchema < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      CREATE TABLE new_events (
        `uuid` String,
        `swishjam_api_key` LowCardinality(String),
        `name` LowCardinality(String),
        `user_profile_id` UUID,
        `properties` String,
        `user_properties` String,
        `ingested_at` DateTime64 DEFAULT now(),
        `occurred_at` DateTime64,
      )
      ENGINE = ReplacingMergeTree(occurred_at)
      ORDER BY (swishjam_api_key, name, occurred_at, uuid)
    SQL
    # PRIMARY KEY (swishjam_api_key, name, occurred_at)

    # TODO: figure out migration strategy :/
    # execute <<~SQL
    #   INSERT INTO new_events (uuid, swishjam_api_key, name, user_profile_id, properties, user_properties, ingested_at, occurred_at)
    #   SELECT 
    #     uuid, 
    #     swishjam_api_key, 
    #     name, 
    #     JSONExtractString(properties, 
    #     -- user_profile_id, 
    #     properties, 
    #     user_properties, 
    #     ingested_at, 
    #     occurred_at
    #   FROM events
    #   LEFT JOIN swishjam_user_profiles ON 
    #     swishjam_user_profiles.user_unique_identifier = JSONExtractString('unique_identifier', JSONExtractString(properties, 'user_attributes')))
    # SQL

    execute('DROP TABLE events')
    execute('RENAME TABLE new_events TO events')
  end
end
