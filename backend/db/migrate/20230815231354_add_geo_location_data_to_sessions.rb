class AddGeoLocationDataToSessions < ActiveRecord::Migration[6.1]
  def up
    add_column :analytics_sessions, :latitude, :float, precision: 10, scale: 6, index: true
    add_column :analytics_sessions, :longitude, :float, precision: 10, scale: 6, index: true
    add_column :analytics_sessions, :city, :string
    add_column :analytics_sessions, :region, :string
    add_column :analytics_sessions, :country, :string
    add_column :analytics_sessions, :postal_code, :string
  end

  def down
    remove_column :analytics_sessions, :latitude
    remove_column :analytics_sessions, :longitude
    remove_column :analytics_sessions, :city
    remove_column :analytics_sessions, :region
    remove_column :analytics_sessions, :country
    remove_column :analytics_sessions, :postal_code
  end
end
