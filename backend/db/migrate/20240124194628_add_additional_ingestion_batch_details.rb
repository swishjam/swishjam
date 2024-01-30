class AddAdditionalIngestionBatchDetails < ActiveRecord::Migration[6.1]
  def change
    add_column :ingestion_batches, :num_successful_records, :integer
    add_column :ingestion_batches, :num_failed_records, :integer
  end
end
