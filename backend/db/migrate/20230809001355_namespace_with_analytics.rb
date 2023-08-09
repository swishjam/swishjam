class NamespaceWithAnalytics < ActiveRecord::Migration[6.1]
  def up
    rename_table :organizations, :analytics_organizations
    rename_table :users, :analytics_users
    rename_table :organization_users, :analytics_organization_users
    rename_table :devices, :analytics_devices
    rename_table :sessions, :analytics_sessions
    rename_table :page_hits, :analytics_page_hits
    rename_table :events, :analytics_events
    rename_table :metadata, :analytics_metadata

    create_table :integrations do |t|
      t.references :instance
      t.string :type
      t.jsonb :config
      t.boolean :enabled
      t.timestamps
    end
  end
end
