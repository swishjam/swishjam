class AddSyncedObjectToDataSyncs < ActiveRecord::Migration[6.1]
  def change
    add_reference :data_syncs, :synced_object, polymorphic: true, index: true, type: :uuid
  end
end
