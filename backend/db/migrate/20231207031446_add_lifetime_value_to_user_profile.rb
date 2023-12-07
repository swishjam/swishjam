class AddLifetimeValueToUserProfile < ActiveRecord::Migration[6.1]
  def change
    add_column :analytics_user_profiles, :lifetime_value_in_cents, :integer, default: 0, null: false
    add_column :analytics_organization_profiles, :lifetime_value_in_cents, :integer, default: 0, null: false
  end
end
