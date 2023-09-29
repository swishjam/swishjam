class CreateApiKeysTable < ActiveRecord::Migration[6.1]
  def up
    create_table :api_keys, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, foreign_key: true
      t.string :data_source
      t.string :public_key
      t.string :private_key
      t.boolean :enabled
      t.timestamps
    end

    add_index :api_keys, :public_key, unique: true
    add_index :api_keys, :private_key, unique: true
    add_index :api_keys, :data_source

    drop_table :analytics_family_configurations
  end

  def down
    drop_table :api_keys
  end
end
