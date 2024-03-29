class CreateWorkspaceSettings < ActiveRecord::Migration[6.1]
  def up
    return if table_exists?(:workspace_settings)
    create_table :workspace_settings, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, foreign_key: true
      t.boolean :use_product_data_source_in_lieu_of_marketing
      t.boolean :use_marketing_data_source_in_lieu_of_product
      t.timestamps
    end
  end

  def down
  end
end
