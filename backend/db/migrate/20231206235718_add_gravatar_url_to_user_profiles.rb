class AddGravatarUrlToUserProfiles < ActiveRecord::Migration[6.1]
  def change
    add_column :analytics_user_profiles, :gravatar_url, :string
  end
end
