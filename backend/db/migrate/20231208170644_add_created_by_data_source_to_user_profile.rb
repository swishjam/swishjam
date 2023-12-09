class AddCreatedByDataSourceToUserProfile < ActiveRecord::Migration[6.1]
  def change
    add_column :analytics_user_profiles, :created_by_data_source, :string
  end
end
