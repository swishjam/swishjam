class MoveShouldEnrichUserProfileDataToWorkspaceSettings < ActiveRecord::Migration[6.1]
  def change
    add_column :workspace_settings, :should_enrich_user_profile_data, :boolean
  end
end
