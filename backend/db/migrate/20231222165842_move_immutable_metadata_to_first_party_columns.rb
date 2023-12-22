class MoveImmutableMetadataToFirstPartyColumns < ActiveRecord::Migration[6.1]
  def change
    add_column :analytics_user_profiles, :initial_landing_page_url, :text
    add_column :analytics_user_profiles, :initial_referrer_url, :string
    add_column :analytics_user_profiles, :first_seen_at_in_web_app, :datetime
  end
end
