class CreateUserSegments < ActiveRecord::Migration[6.1]
  def change
    create_table :user_segments, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, foreign_key: true
      t.references :created_by_user, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.string :name, null: false
      t.string :description
      t.timestamps
    end

    create_table :query_filter_groups, id: :uuid do |t|
      t.references :filterable, polymorphic: true, type: :uuid, null: false
      t.references :parent_query_filter_group, type: :uuid, foreign_key: { to_table: :query_filter_groups }
      t.integer :sequence_index, null: false
      t.string :previous_query_filter_group_relationship_operator
    end

    create_table :query_filters, id: :uuid do |t|
      t.references :query_filter_group, type: :uuid, null: false, foreign_key: true
      t.string :type, null: false
      t.integer :sequence_index, null: false
      t.string :previous_query_filter_relationship_operator
      t.jsonb :config, null: false
    end
  end
end