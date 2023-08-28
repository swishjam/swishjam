class CreateEventsTable < ActiveRecord::Migration[6.1]
  def up
    create_table :events, options: 'MergeTree() ORDER BY (swishjam_api_key, occurred_at)' do |t|
      t.string :swishjam_api_key, null: false
      t.string :uuid, null: false
      # t.string :device_identifier, null: false
      # t.string :session_identifier, null: false
      # t.string :swishjam_organization_id
      t.string :name, null: false
      t.string :properties, null: false
      t.datetime :occurred_at, null: false
      t.datetime :ingested_at, null: false
    end

    create_table :user_identify_events, options: 'MergeTree() ORDER BY (swishjam_api_key, occurred_at)' do |t|
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