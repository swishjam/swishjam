class CreateWorkspaceSettings < ActiveRecord::Migration[6.1]
  def change
    create_table :workspace_settings, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, foreign_key: true
      t.boolean :use_product_data_source_in_lieu_of_marketing
      t.boolean :use_marketing_data_source_in_lieu_of_product
      t.timestamps
    end
    
    Workspace.includes(:settings).where(settings: { id: nil }).each do |workspace|
      WorkspaceSetting.generate_default_for(workspace)
    end
  end
end
