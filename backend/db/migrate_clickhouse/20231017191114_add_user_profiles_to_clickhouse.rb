class AddUserProfilesToClickhouse < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      CREATE TABLE swishjam_user_profiles(
        `swishjam_api_key` String,
        `swishjam_user_id` String,
        `unique_identifier` String,
        `created_at` DateTime
      ) ENGINE = MergeTree
      PRIMARY KEY (swishjam_api_key, created_at)
    SQL
  end

  def down
    execute <<~SQL
      DROP TABLE IF EXISTS swishjam_user_profiles
    SQL
  end
end
