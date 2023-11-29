class AddImmutableMetadataToUserProfiles < ActiveRecord::Migration[6.1]
  def up
    execute <<-SQL
      ALTER TABLE swishjam_user_profiles ADD COLUMN immutable_metadata String
    SQL
  end

  def down
    execute <<-SQL
      ALTER TABLE swishjam_user_profiles DROP COLUMN immutable_metadata
    SQL
  end
end
