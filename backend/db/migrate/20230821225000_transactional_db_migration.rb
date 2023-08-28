class TransactionalDbMigration < ActiveRecord::Migration[6.1]
  def up
    enable_extension 'pgcrypto'

    create_table :workspaces, id: :uuid do |t|
      t.string :name, null: false
      t.string :company_url
      t.string :public_key, null: false, index: true
      t.timestamps
    end

    create_table :users, id: :uuid do |t|
      t.string :email, null: false, index: true
      t.string :password_digest, null: false
      t.string :jwt_secret_key, null: false, index: true
      t.string :first_name
      t.string :last_name
      t.timestamps
    end

    create_table :workspace_members, id: :uuid do |t|
      t.references :workspace, foreign_key: true, null: false, type: :uuid
      t.references :user, foreign_key: true, null: false, type: :uuid
      t.timestamps
    end

    create_table :auth_sessions, id: :uuid do |t|
      t.references :user, foreign_key: true, type: :uuid
      t.string :jwt_value
      t.timestamps
    end

    create_table :integrations, id: :uuid do |t|
      t.references :workspace, foreign_key: true, null: false, type: :uuid
      t.string :type, null: false
      t.jsonb :config
      t.boolean :enabled
      t.timestamps
    end

    create_table :data_syncs, id: :uuid do |t|
      t.references :workspace, foreign_key: true, null: false, type: :uuid
      t.string :provider, null: false
      t.timestamp :started_at
      t.timestamp :completed_at
      t.integer :duration_in_seconds
      t.text :error_message
      t.timestamps
    end

    create_table :analytics_user_profiles, id: :uuid do |t|
      t.references :workspace, foreign_key: true, null: false, type: :uuid
      t.string :user_unique_identifier, index: true
      t.string :email
      t.string :first_name
      t.string :last_name
      t.jsonb :metadata
      t.timestamps
    end

    create_table :analytics_organization_profiles, id: :uuid do |t|
      t.references :workspace, foreign_key: true, null: false, type: :uuid
      t.string :organization_unique_identifier, index: { name: 'index_analytics_organization_profiles_unique_identifier' }
      t.string :name
      t.jsonb :metadata
      t.timestamps
    end

    create_table :analytics_organization_profiles_users, id: :uuid do |t|
      t.references :analytics_organization_profile, foreign_key: true, null: false, type: :uuid, index: { name: 'index_analytics_organization_profiles_users_organizations' }
      t.references :analytics_user_profile, foreign_key: true, null: false, type: :uuid, index: { name: 'index_analytics_organization_profiles_users_users' }
      t.timestamps
    end
  end

  def down
    drop_table :analytics_organization_profiles, force: :cascade
    drop_table :analytics_devices, force: :cascade
    drop_table :analytics_user_profiles, force: :cascade
    drop_table :analytics_organization_profiles_users, force: :cascade
    drop_table :data_syncs, force: :cascade
    drop_table :integrations, force: :cascade
    drop_table :auth_sessions, force: :cascade
    drop_table :workspace_members, force: :cascade
    drop_table :users, force: :cascade
    drop_table :workspaces, force: :cascade
  end
end
