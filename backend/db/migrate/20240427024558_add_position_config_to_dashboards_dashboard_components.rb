class AddPositionConfigToDashboardsDashboardComponents < ActiveRecord::Migration[6.1]
  def change
    add_column :dashboard_components, :title, :string
    add_column :dashboard_components, :subtitle, :string
    add_column :dashboards_dashboard_components, :position_config, :jsonb, null: false, default: {}
  end
end
