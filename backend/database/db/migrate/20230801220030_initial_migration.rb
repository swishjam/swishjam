class InitialMigration < ActiveRecord::Migration[6.1]
  def up
    create_table :instances do |t|
      t.string :public_key, index: true
      t.timestamps
    end

    create_table :organizations do |t|
      t.references :instance
      t.string :name
      t.string :unique_identifier, index: true
      t.timestamps
    end

    create_table :users do |t|
      t.references :instance
      t.string :unique_identifier, index: true
      t.string :email
      t.string :first_name
      t.string :last_name
      t.timestamps
    end

    create_table :organization_users do |t|
      t.references :organization
      t.references :user
      t.timestamps
    end

    create_table :devices do |t|
      t.references :instance
      t.references :user, optional: true
      t.string :fingerprint, index: true
      t.string :user_agent
      t.string :browser
      t.string :browser_version
      t.string :os
      t.string :os_version
      t.string :device
      t.timestamps
    end

    create_table :sessions do |t|
      t.references :organization
      t.references :device
      t.string :unique_identifier, index: true
      t.datetime :start_time
      t.datetime :end_time
      t.timestamps
    end

    create_table :page_hits do |t|
      t.references :device
      t.references :session
      t.string :unique_identifier, index: true
      t.string :full_url
      t.string :url_host
      t.string :url_path
      t.string :url_query
      t.string :referrer_full_url
      t.string :referrer_url_host
      t.string :referrer_url_path
      t.string :referrer_url_query
      t.datetime :start_time
      t.datetime :end_time
      t.timestamps
    end

    create_table :events do |t|
      t.references :device
      t.references :session
      t.references :page_hit
      t.string :name
      t.datetime :timestamp
      t.timestamps
    end

    create_table :metadata do |t|
      t.references :parent, polymorphic: true
      t.string :key
      t.string :value
      t.timestamps
    end
  end

  def down
    drop_table :instances
    drop_table :devices
    drop_table :organizations
    drop_table :users
    drop_table :sessions
    drop_table :page_hits
    drop_table :events
    drop_table :metadata
  end
end
