class InstancesToOrganizations < ActiveRecord::Migration[6.1]
  def up
    rename_table :users, :swishjam_users
    rename_table :sessions, :swishjam_sessions
    rename_table :organizations, :swishjam_organizations
    rename_table :organization_users, :swishjam_organization_users
    rename_table :integrations, :swishjam_integrations
    rename_table :data_syncs, :swishjam_data_syncs
    rename_column :swishjam_organization_users, :organization_id, :swishjam_organization_id
    rename_column :swishjam_organization_users, :user_id, :swishjam_user_id
    rename_column :swishjam_sessions, :user_id, :swishjam_user_id
    rename_column :swishjam_integrations, :instance_id, :swishjam_organization_id

    rename_column :analytics_users, :instance_id, :swishjam_organization_id
    rename_column :analytics_sessions, :organization_id, :analytics_organization_id
    rename_column :analytics_sessions, :device_id, :analytics_device_id
    rename_column :analytics_payments, :instance_id, :swishjam_organization_id
    rename_column :analytics_page_hits, :device_id, :analytics_device_id
    rename_column :analytics_page_hits, :session_id, :analytics_session_id
    rename_column :analytics_organizations, :instance_id, :swishjam_organization_id
    rename_column :analytics_organization_users, :organization_id, :analytics_organization_id
    rename_column :analytics_events, :device_id, :analytics_device_id
    rename_column :analytics_events, :session_id, :analytics_session_id
    rename_column :analytics_events, :page_hit_id, :analytics_page_hit_id
    rename_column :analytics_devices, :instance_id, :swishjam_organization_id
    rename_column :analytics_devices, :user_id, :analytics_user_id
    remove_column :analytics_customer_subscriptions, :instance_id

    add_reference :analytics_customer_subscriptions, :swishjam_organization, index: { name: 'index_a_customer_subs_on_sj_organization_id' }
    remove_column :analytics_customer_billing_data_snapshots, :instance_id
    add_reference :analytics_customer_billing_data_snapshots, :swishjam_organization, index: { name: 'index_a_customer_billing_data_snaps_on_sj_organization_id' }
    remove_column :analytics_billing_data_snapshots, :instance_id
    add_reference :analytics_billing_data_snapshots, :swishjam_organization, index: { name: 'index_a_billing_data_snaps_on_sj_organization_id' }

    drop_table :instances, force: :cascade
    add_column :swishjam_organizations, :public_key, :string, index: true
  end
end
