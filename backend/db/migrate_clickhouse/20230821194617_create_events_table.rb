class CreateEventsTable < ActiveRecord::Migration[6.1]
  def up
    create_table :events, options: 'MergeTree() ORDER BY (swishjam_api_key, name, toMonth(occurred_at))' do |t|
      t.string :swishjam_api_key, null: false
      t.string :uuid, null: false
      t.string :name, null: false
      t.string :device_identifier
      t.string :session_identifier
      t.string :swishjam_organization_id
      t.string :url
      t.string :url_host
      t.string :url_path
      t.string :url_query
      t.string :referrer_url
      t.string :referrer_url_host
      t.string :referrer_url_path
      t.string :referrer_url_query
      t.string :utm_source
      t.string :utm_medium
      t.string :utm_campaign
      t.string :utm_term
      t.boolean :is_mobile
      t.string :device_type
      t.string :browser
      t.string :browser_version
      t.string :os
      t.string :os_version
      t.string :user_agent
      t.string :properties, null: false
      t.datetime :occurred_at, null: false
      t.datetime :ingested_at, null: false
    end

    create_table :user_identify_events, options: 'MergeTree() ORDER BY (swishjam_api_key, toMonth(occurred_at))' do |t|
      t.string :swishjam_api_key, null: false
      t.string :uuid, null: false
      t.string :device_identifier, null: false
      t.string :swishjam_user_id, null: false
      t.datetime :occurred_at, null: false
      t.datetime :ingested_at, null: false
    end
  end

  def down
    drop_table :events
    drop_table :user_identify_events
  end
end