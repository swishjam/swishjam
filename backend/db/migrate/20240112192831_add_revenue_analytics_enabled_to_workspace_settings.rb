class AddRevenueAnalyticsEnabledToWorkspaceSettings < ActiveRecord::Migration[6.1]
  def change
    add_column :workspace_settings, :revenue_analytics_enabled, :boolean, default: true, null: false
  end
end
