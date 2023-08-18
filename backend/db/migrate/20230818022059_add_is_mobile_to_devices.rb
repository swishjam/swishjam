class AddIsMobileToDevices < ActiveRecord::Migration[6.1]
  def up
    add_column :analytics_devices, :is_mobile, :boolean
  end

  def down
    remove_column :analytics_devices, :is_mobile
  end
end
