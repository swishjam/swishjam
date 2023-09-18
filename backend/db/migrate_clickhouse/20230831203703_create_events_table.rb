class CreateEventsTable < ActiveRecord::Migration[6.1]
  def up
    execute('DROP TABLE IF EXISTS events')
    execute <<~SQL
      CREATE TABLE events (
        `uuid` String,
        `swishjam_api_key` LowCardinality(String),
        `name` LowCardinality(String),
        `analytics_family` Enum('marketing', 'product', 'blog', 'docs', 'other') DEFAULT 'other',
        `ingested_at` DateTime DEFAULT now(),
        `occurred_at` DateTime,
        `properties` String,
      )
      ENGINE = MergeTree()
      ORDER BY (analytics_family, swishjam_api_key, name, occurred_at)
    SQL
  end

  def down
    execute('DROP TABLE IF EXISTS events')
  end
end
