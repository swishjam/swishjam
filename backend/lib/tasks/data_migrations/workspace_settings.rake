namespace :data_migrations do
  desc "Adds workspace_settings to any workspace that doesn't have one."
  task migrate_workspace_api_keys: [:environment] do
    Workspace.includes(:settings).where(settings: { id: nil }).each do |workspace|
      WorkspaceSetting.generate_default_for(workspace)
    end
  end
end