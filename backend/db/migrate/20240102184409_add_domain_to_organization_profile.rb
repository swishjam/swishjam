class AddDomainToOrganizationProfile < ActiveRecord::Migration[6.1]
  def change
    add_column :analytics_organization_profiles, :domain, :string
  end
end
