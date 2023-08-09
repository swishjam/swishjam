class CreateDataSyncsTable < ActiveRecord::Migration[6.1]
  def up
    create_table :data_syncs do |t|
      t.references :instance, null: false, foreign_key: true
      t.string :provider, null: false
      t.timestamp :started_at
      t.timestamp :completed_at
      t.integer :duration_in_seconds
      t.text :error_message
      t.timestamps
    end
  end

  def down
    drop_table :data_syncs
  end
end
