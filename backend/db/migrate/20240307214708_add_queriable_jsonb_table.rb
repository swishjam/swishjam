class AddQueriableJsonbTable < ActiveRecord::Migration[6.1]
  def change
    remove_column :automation_steps, :sequence_index
    remove_column :automations, :entry_point_event_name

    create_table :indexed_jsonb_keys, id: :uuid do |t|
      t.references :parent, type: :uuid, polymorphic: true, null: false
      t.string :key, null: false, index: true
      t.string :value, null: false, index: true
      t.timestamps
    end
  end
end
