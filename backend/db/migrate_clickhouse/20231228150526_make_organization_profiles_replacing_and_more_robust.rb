class MakeOrganizationProfilesReplacingAndMoreRobust < ActiveRecord::Migration[6.1]
  def up
    execute('DROP TABLE IF EXISTS swishjam_organization_profiles')
    execute <<~SQL
      CREATE TABLE swishjam_organization_profiles (
        `swishjam_api_key` LowCardinality(String),
        `workspace_id` String,
        `swishjam_organization_id` String,
        `organization_unique_identifier` Nullable(String),
        `name` Nullable(String),
        `lifetime_value_in_cents` Int64,
        `monthly_recurring_revenue_in_cents` Int64,
        `current_subscription_plan_name` Nullable(String),
        `metadata` String,
        `last_updated_from_transactional_db_at` Nullable(DateTime),
        `created_at` DateTime,
        `updated_at` DateTime
      )
      ENGINE = ReplacingMergeTree(updated_at)
      PRIMARY KEY (workspace_id, swishjam_api_key)
      ORDER BY (workspace_id, swishjam_api_key, swishjam_organization_id)
    SQL
  end

  def down
    execute('DROP TABLE swishjam_organization_profiles')
  end
end
