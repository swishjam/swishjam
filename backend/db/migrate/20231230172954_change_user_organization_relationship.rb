class ChangeUserOrganizationRelationship < ActiveRecord::Migration[6.1]
  def up
    drop_table :analytics_organization_profiles_users if table_exists? :analytics_organization_profiles_users
    create_table :analytics_organization_profiles_users do |t|
      t.references :analytics_organization_profile, null: false, index: { name: 'index_organization_profiles_users_on_org_unique_identifier' }
      t.references :analytics_user_profile, null: false, index: { name: 'index_organization_profiles_users_on_user_unique_identifier' }
      t.timestamps
    end
  end

  def down
    drop_table :analytics_organization_profiles_users if table_exists? :analytics_organization_profiles_users
  end
end
