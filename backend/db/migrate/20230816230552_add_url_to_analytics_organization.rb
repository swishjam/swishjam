class AddUrlToAnalyticsOrganization < ActiveRecord::Migration[6.1]
  def up
    add_column :analytics_organizations, :url, :string
  end

  def down
    remove_column :analytics_organizations, :url
  end
end
