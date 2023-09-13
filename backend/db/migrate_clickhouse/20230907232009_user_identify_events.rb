class UserIdentifyEvents < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      CREATE TABLE user_identify_events (
        `uuid` String,
        `swishjam_api_key` LowCardinality(String),
        `device_identifier` String,
        `swishjam_user_id` String,
        `occurred_at` DateTime,
        `ingested_at` DateTime DEFAULT now()
      )
      ENGINE = ReplacingMergeTree()
      PRIMARY KEY (swishjam_api_key, device_identifier)
    SQL
  end

  def down
    execute('DROP TABLE IF EXISTS user_identify_events')
  end
end
