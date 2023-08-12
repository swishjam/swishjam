class InitialMigrations < ActiveRecord::Migration[6.1]
  def up
    enable_extension 'pgcrypto'

    # Swishjam tables

    create_table :swishjam_organizations, id: :uuid do |t|
      t.string :name
      t.string :url
      t.string :public_key, index: true
      t.timestamps
    end

    create_table :swishjam_users, id: :uuid do |t|
      t.string :email
      t.string :first_name
      t.string :last_name
      t.string :password_digest
      t.string :jwt_secret_key
      t.timestamps
    end

    create_table :swishjam_organization_users, id: :uuid do |t|
      t.references :swishjam_organization, foreign_key: true, type: :uuid
      t.references :swishjam_user, foreign_key: true, type: :uuid
      t.timestamps
    end

    create_table :swishjam_sessions, id: :uuid do |t|
      t.references :swishjam_user, foreign_key: true, type: :uuid
      t.string :jwt_value
      t.timestamps
    end

    create_table :swishjam_integrations, id: :uuid do |t|
      t.references :swishjam_organization, foreign_key: true, type: :uuid
      t.string :type
      t.jsonb :config
      t.boolean :enabled
      t.timestamps
    end

    create_table :swishjam_data_syncs, id: :uuid do |t|
      t.references :swishjam_organization, foreign_key: true, type: :uuid
      t.string :provider, null: false
      t.timestamp :started_at
      t.timestamp :completed_at
      t.integer :duration_in_seconds
      t.text :error_message
      t.timestamps
    end


    # Analytics tables

    create_table :analytics_organizations, id: :uuid do |t|
      t.references :swishjam_organization, foreign_key: true, type: :uuid
      t.string :name
      t.string :unique_identifier, index: true
      t.timestamps
    end

    create_table :analytics_users, id: :uuid do |t|
      t.references :swishjam_organization, foreign_key: true, type: :uuid
      t.string :unique_identifier, index: true
      t.string :email
      t.string :first_name
      t.string :last_name
      t.timestamps
    end

    create_table :analytics_organization_users, id: :uuid do |t|
      t.references :analytics_organization, foreign_key: true, type: :uuid
      t.references :analytics_user, foreign_key: true, type: :uuid
      t.timestamps
    end

    create_table :analytics_devices, id: :uuid do |t|
      t.references :swishjam_organization, foreign_key: true, type: :uuid
      t.references :analytics_user, optional: true, foreign_key: true, type: :uuid
      t.string :fingerprint, index: true
      t.string :user_agent
      t.string :browser
      t.string :browser_version
      t.string :os
      t.string :os_version
      t.string :device
      t.timestamps
    end

    create_table :analytics_sessions, id: :uuid do |t|
      t.references :analytics_organization, foreign_key: true, type: :uuid
      t.references :analytics_device, foreign_key: true, type: :uuid
      t.string :unique_identifier, index: true
      t.datetime :start_time
      t.datetime :end_time
      t.timestamps
    end

    create_table :analytics_page_hits, id: :uuid do |t|
      t.references :analytics_device, foreign_key: true, type: :uuid
      t.references :analytics_session, foreign_key: true, type: :uuid
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

    create_table :analytics_events, id: :uuid do |t|
      t.references :analytics_device, foreign_key: true, type: :uuid
      t.references :analytics_session, foreign_key: true, type: :uuid
      t.references :analytics_page_hit, foreign_key: true, type: :uuid
      t.string :name
      t.datetime :timestamp
      t.timestamps
    end

    create_table :analytics_metadata, id: :uuid do |t|
      t.references :parent, polymorphic: true, type: :uuid
      t.string :key
      t.string :value
      t.timestamps
    end

    create_table :analytics_billing_data_snapshots, id: :uuid do |t|
      t.references :swishjam_organization, foreign_key: true, type: :uuid, index: { name: 'index_a_billing_data_snapshots_on_sj_organization_id' }
      t.integer :mrr_in_cents
      t.integer :total_revenue_in_cents
      t.integer :num_active_subscriptions
      t.integer :num_free_trial_subscriptions
      t.integer :num_canceled_subscriptions
      t.timestamp :captured_at
      t.timestamps
    end

    create_table :analytics_payments, id: :uuid do |t|
      t.references :swishjam_organization, foreign_key: true, type: :uuid
      t.string :payment_processor
      t.string :provider_id
      t.string :customer_email
      t.string :customer_name
      t.integer :amount_in_cents
      t.timestamp :charged_at
      t.string :status
      t.timestamps
    end

    create_table :analytics_customer_subscriptions, id: :uuid do |t|
      t.references :swishjam_organization, foreign_key: true, type: :uuid, index: { name: 'index_a_customer_subscriptions_on_sj_organization_id' }
      t.string :payment_processor
      t.string :provider_id
      t.string :customer_email
      t.string :customer_name
      t.integer :amount_in_cents
      t.string :interval
      t.string :plan_name
      t.string :status
      t.timestamp :started_at
      t.timestamp :next_charge_runs_at
      t.timestamp :ends_at
      t.timestamp :free_trial_starts_at
      t.timestamp :free_trial_ends_at
      t.timestamps
    end

    create_table :analytics_customer_billing_data_snapshots, id: :uuid do |t|
      t.references :swishjam_organization, foreign_key: true, type: :uuid, index: { name: 'index_a_customer_billing_data_snapshots_on_sj_organization_id' }
      t.string :customer_email
      t.string :customer_name
      t.integer :mrr_in_cents
      t.integer :total_revenue_in_cents
      t.timestamp :captured_at
      t.timestamps
    end
  end

  def down
    drop_table :swishjam_organization_users, cascade: true
    drop_table :swishjam_integrations, cascade: true
    drop_table :swishjam_sessions, cascade: true
    drop_table :swishjam_data_syncs, cascade: true
    drop_table :swishjam_users, cascade: true
    
    drop_table :analytics_organization_users, cascade: true
    drop_table :analytics_events, cascade: true
    drop_table :analytics_metadata, cascade: true
    drop_table :analytics_page_hits, cascade: true
    drop_table :analytics_sessions, cascade: true
    drop_table :analytics_devices, cascade: true
    drop_table :analytics_users, cascade: true
    drop_table :analytics_organizations, cascade: true
    drop_table :analytics_customer_subscriptions, cascade: true
    drop_table :analytics_customer_billing_data_snapshots, cascade: true
    drop_table :analytics_payments, cascade: true
    drop_table :analytics_billing_data_snapshots, cascade: true

    drop_table :swishjam_organizations, cascade: true
  end
end
