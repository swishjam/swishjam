class CleanUserProfilesTable < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      CREATE TABLE new_swishjam_user_profiles (
        `workspace_id` LowCardinality(String),
        `swishjam_user_id` String,
        `merged_into_swishjam_user_id` Nullable(String),
        `user_unique_identifier` Nullable(String),
        `email` Nullable(String),
        `gravatar_url` Nullable(String),
        `metadata` String,
        `created_by_data_source` LowCardinality(String),
        `first_seen_at_in_web_app` Nullable(DateTime),
        `last_seen_at_in_web_app` Nullable(DateTime),
        `last_updated_from_transactional_db_at` Nullable(DateTime),
        `created_at` DateTime,
        `updated_at` DateTime
      )
      ENGINE = ReplacingMergeTree(updated_at)
      ORDER BY (workspace_id, swishjam_user_id)
      PRIMARY KEY (workspace_id, swishjam_user_id)
    SQL

    execute('RENAME TABLE swishjam_user_profiles TO old_swishjam_user_profiles')
    execute('RENAME TABLE new_swishjam_user_profiles TO swishjam_user_profiles')
  end

  def down
    execute('DROP TABLE swishjam_user_profiles')
    execute('RENAME TABLE old_swishjam_user_profiles TO swishjam_user_profiles')
  end
end
