class AddPositionConfigToDashboardsDashboardComponents < ActiveRecord::Migration[6.1]
  def change
    create_table :data_visualizations, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, foreign_key: true
      t.references :created_by_user, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.string :title
      t.string :subtitle
      t.string :visualization_type
      t.jsonb :config, null: false, default: {}
      t.timestamps
    end

    create_table :dashboard_data_visualizations, id: :uuid do |t|
      t.references :dashboard, type: :uuid, null: false, foreign_key: true
      t.references :data_visualization, type: :uuid, null: false, foreign_key: true
      t.jsonb :position_config, null: false, default: {}
      t.timestamps
    end
  end
end
