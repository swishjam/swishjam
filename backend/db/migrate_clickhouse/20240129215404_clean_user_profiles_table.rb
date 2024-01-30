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

    execute <<~SQL
      INSERT INTO new_swishjam_user_profiles (
        workspace_id,
        swishjam_user_id,
        merged_into_swishjam_user_id,
        user_unique_identifier,
        email,
        gravatar_url,
        metadata,
        first_seen_at_in_web_app,
        last_seen_at_in_web_app,
        last_updated_from_transactional_db_at,
        created_at,
        updated_at
      )
      SELECT 
        workspace_id,
        swishjam_user_id,
        merged_into_swishjam_user_id,
        user_unique_identifier,
        email,
        gravatar_url,
        concat(
          '{',
          if(notEmpty(first_name), concat('"first_name":"', first_name, '",'), ''),
          if(
            notEmpty(last_name), 
            concat('"last_name":"', last_name, if(JSONLength(metadata) > 0, '",', '"')), 
            ''
          ),
          substring(metadata, 2, length(metadata) - 2),
          '}'
        ) AS metadata,
        first_seen_at_in_web_app,
        last_seen_at_in_web_app,
        last_updated_from_transactional_db_at,
        created_at,
        updated_at
      FROM swishjam_user_profiles
    SQL

    execute('RENAME TABLE swishjam_user_profiles TO old_swishjam_user_profiles')
    execute('RENAME TABLE new_swishjam_user_profiles TO swishjam_user_profiles')
  end

  def down
    execute('DROP TABLE swishjam_user_profiles')
    execute('RENAME TABLE old_swishjam_user_profiles TO swishjam_user_profiles')
  end
end
