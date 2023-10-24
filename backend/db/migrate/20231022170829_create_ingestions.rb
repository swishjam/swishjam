class CreateIngestions < ActiveRecord::Migration[6.1]
  def change
    create_table :ingestion_batches, id: :uuid do |t|
      t.string :event_type
      t.float :num_seconds_to_complete
      t.integer :num_records
      t.string :error_message
      t.timestamp :started_at
      t.timestamp :completed_at
    end
  end
end
