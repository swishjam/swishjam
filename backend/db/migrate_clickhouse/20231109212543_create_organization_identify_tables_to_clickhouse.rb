class CreateOrganizationIdentifyTablesToClickhouse < ActiveRecord::Migration[6.1]
  def up
    execute('DROP TABLE organization_identify_events')
    execute <<~SQL
      CREATE TABLE organization_identify_events (
        `uuid` String,
        `swishjam_api_key` LowCardinality(String),
        `organization_device_identifier` String,
        `swishjam_organization_id` String,
        `occurred_at` DateTime,
        `ingested_at` DateTime DEFAULT now()
      )
      ENGINE = ReplacingMergeTree()
      PRIMARY KEY (swishjam_api_key, organization_device_identifier)
    SQL

    execute <<~SQL
      CREATE TABLE swishjam_organization_profiles(
        `swishjam_api_key` String,
        `swishjam_organization_id` String,
        `unique_identifier` String,
        `created_at` DateTime
      ) ENGINE = MergeTree
      PRIMARY KEY (swishjam_api_key, created_at)
    SQL
  end

  def down
    execute('DROP TABLE organization_identify_events')
    execute('DROP TABLE swishjam_organization_profiles')
  end
end
