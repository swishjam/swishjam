class CreateDashboardTables < ActiveRecord::Migration[6.1]
  def up
    create_table :dashboards, id: :uuid do |t|
      t.references :workspace, type: :uuid
      t.references :created_by_user, type: :uuid
      t.string :name
      t.timestamps
    end

    create_table :dashboard_components, id: :uuid do |t|
      t.references :workspace, type: :uuid
      t.references :created_by_user, type: :uuid
      t.jsonb :configuration
      t.timestamps
    end

    create_table :dashboards_dashboard_components do |t|
      t.references :dashboard, type: :uuid
      t.references :dashboard_component, type: :uuid
      t.index [:dashboard_id, :dashboard_component_id], unique: true, name: :index_dashboards_dashboard_components
    end
  end

  def down
    drop_table :dashboard_components_dashboards
    drop_table :dashboard_components
    drop_table :dashboards
  end
end
