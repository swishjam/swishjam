class CreateOrganizationIdentificationEvents < ActiveRecord::Migration[6.1]
  def change
    execute <<~SQL
      CREATE TABLE organization_identify_events (
        `uuid` String,
        `swishjam_api_key` LowCardinality(String),
        `session_identifier` String,
        `device_identifier` String,
        `swishjam_organization_id` String,
        `occurred_at` DateTime,
        `ingested_at` DateTime DEFAULT now()
      )
      ENGINE = ReplacingMergeTree()
      PRIMARY KEY (swishjam_api_key, session_identifier)
    SQL
  end
end
