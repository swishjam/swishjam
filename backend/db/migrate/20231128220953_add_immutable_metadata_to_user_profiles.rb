class AddImmutableMetadataToUserProfiles < ActiveRecord::Migration[6.1]
  def change
    add_column :analytics_user_profiles, :immutable_metadata, :jsonb, default: {}
  end
end
