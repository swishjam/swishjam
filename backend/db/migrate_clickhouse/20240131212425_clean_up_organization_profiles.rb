class CleanUpOrganizationProfiles < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      CREATE TABLE new_swishjam_organization_profiles (
        `workspace_id` LowCardinality(String),
        `swishjam_organization_id` String,
        `organization_unique_identifier` Nullable(String),
        `name` Nullable(String),
        `domain` Nullable(String),
        `metadata` String,
        `last_updated_from_transactional_db_at` DateTime,
        `created_at` DateTime,
        `updated_at` DateTime
      )
      ENGINE = ReplacingMergeTree(updated_at)
      ORDER BY (workspace_id, swishjam_organization_id)
      PRIMARY KEY (workspace_id)
    SQL

    execute('RENAME TABLE swishjam_organization_profiles TO old_swishjam_organization_profiles')
    execute('RENAME TABLE new_swishjam_organization_profiles TO swishjam_organization_profiles')
    execute <<~SQL
      INSERT INTO swishjam_organization_profiles (
        workspace_id,
        swishjam_organization_id,
        organization_unique_identifier,
        name,
        domain,
        metadata,
        last_updated_from_transactional_db_at,
        created_at,
        updated_at
      ) 
      SELECT
        workspace_id,
        swishjam_organization_id,
        organization_unique_identifier,
        name,
        NULL AS domain,
        metadata,
        last_updated_from_transactional_db_at,
        created_at,
        updated_at
      FROM old_swishjam_organization_profiles
    SQL
  end

  def down
    execute('DROP TABLE swishjam_organization_profiles')
    execute('RENAME TABLE old_swishjam_organization_profiles TO swishjam_organization_profiles')
  end
end
