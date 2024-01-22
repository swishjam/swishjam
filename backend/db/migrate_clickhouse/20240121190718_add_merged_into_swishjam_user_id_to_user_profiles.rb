class AddMergedIntoSwishjamUserIdToUserProfiles < ActiveRecord::Migration[6.1]
  def up
    execute <<-SQL
      ALTER TABLE swishjam_user_profiles ADD COLUMN merged_into_swishjam_user_id Nullable(String)
    SQL
    execute <<~SQL
      ALTER TABLE swishjam_user_profiles ADD COLUMN last_seen_at_in_web_app Nullable(DateTime)
    SQL
  end

  def down
    execute <<-SQL
      ALTER TABLE swishjam_user_profiles DROP COLUMN merged_into_swishjam_user_id
    SQL
    execute <<-SQL
      ALTER TABLE swishjam_user_profiles DROP COLUMN last_seen_at_in_web_app
    SQL
  end
end
