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

    execute('RENAME TABLE events to old_events')
    execute('RENAME TABLE new_events TO events')
  end

  def down
    # raise ActiveRecord::IrreversibleMigration
    execute('DROP TABLE events')
    execute('RENAME TABLE old_events TO events')
  end
end
