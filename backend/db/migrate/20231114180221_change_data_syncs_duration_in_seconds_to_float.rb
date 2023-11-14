class ChangeDataSyncsDurationInSecondsToFloat < ActiveRecord::Migration[6.1]
  def change
    change_column :data_syncs, :duration_in_seconds, :float
  end
end
