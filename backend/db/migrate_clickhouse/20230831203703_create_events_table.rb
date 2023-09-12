class CreateEventsTable < ActiveRecord::Migration[6.1]
  def up
    execute('DROP TABLE IF EXISTS events')
    execute <<~SQL
      CREATE TABLE events (
        `uuid` String,
        `swishjam_api_key` LowCardinality(String),
        `name` LowCardinality(String),
        `ingested_at` DateTime,
        `occurred_at` DateTime,
        `properties` String,
      )
      ENGINE = MergeTree()
      PRIMARY KEY (swishjam_api_key, name)
      ORDER BY (swishjam_api_key, name, occurred_at)
    SQL
  end

  def down
    execute('DROP TABLE IF EXISTS events')
  end
end
