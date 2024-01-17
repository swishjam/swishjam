class AddUserProfileDevicesTables < ActiveRecord::Migration[6.1]
  def change
    create_table :analytics_user_profile_devices, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, foreign_key: true
      t.references :analytics_user_profile, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_user_profile_devices_on_user_profile_id' }
      t.string :device_fingerprint, index: true
      t.string :swishjam_cookie_value, index: true
      t.timestamps
    end

    create_table :analytics_user_profile_device_historical_owners, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_device_historical_owners_on_workspace_id' }
      t.references :analytics_user_profile_device, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_device_historical_owners_on_user_profile_device_id' }
      t.references :analytics_user_profile, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_device_historical_owners_on_user_profile_id' }
      t.timestamps
    end

    add_reference :analytics_user_profiles, :merged_into_analytics_user_profile, type: :uuid, index: { name: 'idx_user_profiles_on_merged_into_user_profile_id' }
  end
end
