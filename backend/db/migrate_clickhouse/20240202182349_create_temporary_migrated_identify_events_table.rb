class CreateTemporaryMigratedIdentifyEventsTable < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      CREATE TABLE migrated_user_identify_events_TEMP (
        `uuid` String,
        `swishjam_api_key` LowCardinality(String),
        `device_identifier` String,
        `swishjam_user_id` String,
        `occurred_at` DateTime,
        `ingested_at` DateTime
      ) 
      ENGINE = MergeTree()
      PRIMARY KEY (swishjam_api_key, device_identifier)
    SQL
  end

  def down
    execute('DROP TABLE IF EXISTS migrated_user_identify_events_TEMP')
  end
end
