class RemoveAnalyticsFamily < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      CREATE TABLE new_events (
        `uuid` String,
        `swishjam_api_key` LowCardinality(String),
        `name` LowCardinality(String),
        `ingested_at` DateTime DEFAULT now(),
        `occurred_at` DateTime,
        `properties` String,
      )
      ENGINE = MergeTree()
      PRIMARY KEY (swishjam_api_key, name, occurred_at)
      ORDER BY (swishjam_api_key, name, occurred_at)
    SQL

    execute <<~SQL
      INSERT INTO new_events (uuid, swishjam_api_key, name, ingested_at, occurred_at, properties)
      SELECT uuid, swishjam_api_key, name, ingested_at, occurred_at, properties
      FROM events
    SQL

    execute('DROP TABLE events')
    execute('RENAME TABLE new_events TO events')
  end
end
