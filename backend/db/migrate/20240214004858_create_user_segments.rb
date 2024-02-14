class CreateUserSegments < ActiveRecord::Migration[6.1]
  def change
    create_table :user_segments, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, foreign_key: true
      t.references :created_by_user, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.string :name, null: false
      t.string :description
      t.timestamps
    end

    create_table :user_segment_filters, id: :uuid do |t|
      t.references :user_segment, type: :uuid, null: false, foreign_key: true
      t.references :parent_filter, type: :uuid, foreign_key: { to_table: :user_segment_filters }
      t.string :parent_relationship_connector
      t.string :object_type, null: false
      t.string :object_attribute, null: false
      t.string :operator, null: false
      t.string :value, null: false
      t.integer :num_days_lookback
    end
  end
end
