# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2023_08_17_015804) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "analytics_billing_data_snapshots", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "swishjam_organization_id"
    t.integer "mrr_in_cents"
    t.integer "total_revenue_in_cents"
    t.integer "num_active_subscriptions"
    t.integer "num_free_trial_subscriptions"
    t.integer "num_canceled_subscriptions"
    t.datetime "captured_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["swishjam_organization_id"], name: "index_a_billing_data_snapshots_on_sj_organization_id"
  end

  create_table "analytics_customer_billing_data_snapshots", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "swishjam_organization_id"
    t.string "customer_email"
    t.string "customer_name"
    t.integer "mrr_in_cents"
    t.integer "total_revenue_in_cents"
    t.datetime "captured_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "owner_type"
    t.uuid "owner_id"
    t.index ["owner_type", "owner_id"], name: "index_analytics_customer_billing_data_snapshots_on_owner"
    t.index ["swishjam_organization_id"], name: "index_a_customer_billing_data_snapshots_on_sj_organization_id"
  end

  create_table "analytics_customer_payments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "swishjam_organization_id"
    t.string "payment_processor"
    t.string "provider_id"
    t.string "customer_email"
    t.string "customer_name"
    t.integer "amount_in_cents"
    t.datetime "charged_at"
    t.string "status"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "owner_type"
    t.uuid "owner_id"
    t.index ["owner_type", "owner_id"], name: "index_analytics_customer_payments_on_owner"
    t.index ["swishjam_organization_id"], name: "index_analytics_customer_payments_on_swishjam_organization_id"
  end

  create_table "analytics_customer_subscription_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "analytics_customer_subscription_id"
    t.integer "quantity"
    t.integer "unit_amount_in_cents"
    t.string "interval"
    t.string "plan_name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["analytics_customer_subscription_id"], name: "index_a_customer_subscription_items_on_subscription_id"
  end

  create_table "analytics_customer_subscriptions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "swishjam_organization_id"
    t.string "payment_processor"
    t.string "provider_id"
    t.string "customer_email"
    t.string "customer_name"
    t.integer "amount_in_cents"
    t.string "interval"
    t.string "plan_name"
    t.string "status"
    t.datetime "started_at"
    t.datetime "next_charge_runs_at"
    t.datetime "ends_at"
    t.datetime "free_trial_starts_at"
    t.datetime "free_trial_ends_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "owner_type"
    t.uuid "owner_id"
    t.index ["owner_type", "owner_id"], name: "index_analytics_customer_subscriptions_on_owner"
    t.index ["swishjam_organization_id"], name: "index_a_customer_subscriptions_on_sj_organization_id"
  end

  create_table "analytics_devices", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "swishjam_organization_id"
    t.uuid "analytics_user_id"
    t.string "fingerprint"
    t.string "user_agent"
    t.string "browser"
    t.string "browser_version"
    t.string "os"
    t.string "os_version"
    t.string "device"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["analytics_user_id"], name: "index_analytics_devices_on_analytics_user_id"
    t.index ["fingerprint"], name: "index_analytics_devices_on_fingerprint"
    t.index ["swishjam_organization_id"], name: "index_analytics_devices_on_swishjam_organization_id"
  end

  create_table "analytics_events", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "analytics_device_id"
    t.uuid "analytics_session_id"
    t.uuid "analytics_page_hit_id"
    t.string "name"
    t.datetime "timestamp"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["analytics_device_id"], name: "index_analytics_events_on_analytics_device_id"
    t.index ["analytics_page_hit_id"], name: "index_analytics_events_on_analytics_page_hit_id"
    t.index ["analytics_session_id"], name: "index_analytics_events_on_analytics_session_id"
  end

  create_table "analytics_metadata", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "parent_type"
    t.uuid "parent_id"
    t.string "key"
    t.string "value"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["parent_type", "parent_id"], name: "index_analytics_metadata_on_parent"
  end

  create_table "analytics_organization_users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "analytics_organization_id"
    t.uuid "analytics_user_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["analytics_organization_id"], name: "index_analytics_organization_users_on_analytics_organization_id"
    t.index ["analytics_user_id"], name: "index_analytics_organization_users_on_analytics_user_id"
  end

  create_table "analytics_organizations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "swishjam_organization_id"
    t.string "name"
    t.string "unique_identifier"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "url"
    t.index ["swishjam_organization_id"], name: "index_analytics_organizations_on_swishjam_organization_id"
    t.index ["unique_identifier"], name: "index_analytics_organizations_on_unique_identifier"
  end

  create_table "analytics_page_hits", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "analytics_device_id"
    t.uuid "analytics_session_id"
    t.string "unique_identifier"
    t.string "full_url"
    t.string "url_host"
    t.string "url_path"
    t.string "url_query"
    t.string "referrer_full_url"
    t.string "referrer_url_host"
    t.string "referrer_url_path"
    t.string "referrer_url_query"
    t.datetime "start_time"
    t.datetime "end_time"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["analytics_device_id"], name: "index_analytics_page_hits_on_analytics_device_id"
    t.index ["analytics_session_id"], name: "index_analytics_page_hits_on_analytics_session_id"
    t.index ["unique_identifier"], name: "index_analytics_page_hits_on_unique_identifier"
  end

  create_table "analytics_sessions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "analytics_organization_id"
    t.uuid "analytics_device_id"
    t.string "unique_identifier"
    t.datetime "start_time"
    t.datetime "end_time"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.float "latitude"
    t.float "longitude"
    t.string "city"
    t.string "region"
    t.string "country"
    t.string "postal_code"
    t.index ["analytics_device_id"], name: "index_analytics_sessions_on_analytics_device_id"
    t.index ["analytics_organization_id"], name: "index_analytics_sessions_on_analytics_organization_id"
    t.index ["unique_identifier"], name: "index_analytics_sessions_on_unique_identifier"
  end

  create_table "analytics_users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "swishjam_organization_id"
    t.string "unique_identifier"
    t.string "email"
    t.string "first_name"
    t.string "last_name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["swishjam_organization_id"], name: "index_analytics_users_on_swishjam_organization_id"
    t.index ["unique_identifier"], name: "index_analytics_users_on_unique_identifier"
  end

  create_table "swishjam_data_syncs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "swishjam_organization_id"
    t.string "provider", null: false
    t.datetime "started_at"
    t.datetime "completed_at"
    t.integer "duration_in_seconds"
    t.text "error_message"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["swishjam_organization_id"], name: "index_swishjam_data_syncs_on_swishjam_organization_id"
  end

  create_table "swishjam_integrations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "swishjam_organization_id"
    t.string "type"
    t.jsonb "config"
    t.boolean "enabled"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["swishjam_organization_id"], name: "index_swishjam_integrations_on_swishjam_organization_id"
  end

  create_table "swishjam_organization_users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "swishjam_organization_id"
    t.uuid "swishjam_user_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["swishjam_organization_id"], name: "index_swishjam_organization_users_on_swishjam_organization_id"
    t.index ["swishjam_user_id"], name: "index_swishjam_organization_users_on_swishjam_user_id"
  end

  create_table "swishjam_organizations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.string "url"
    t.string "public_key"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["public_key"], name: "index_swishjam_organizations_on_public_key"
  end

  create_table "swishjam_sessions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "swishjam_user_id"
    t.string "jwt_value"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["swishjam_user_id"], name: "index_swishjam_sessions_on_swishjam_user_id"
  end

  create_table "swishjam_users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email"
    t.string "first_name"
    t.string "last_name"
    t.string "password_digest"
    t.string "jwt_secret_key"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  add_foreign_key "analytics_billing_data_snapshots", "swishjam_organizations"
  add_foreign_key "analytics_customer_billing_data_snapshots", "swishjam_organizations"
  add_foreign_key "analytics_customer_payments", "swishjam_organizations"
  add_foreign_key "analytics_customer_subscriptions", "swishjam_organizations"
  add_foreign_key "analytics_devices", "analytics_users"
  add_foreign_key "analytics_devices", "swishjam_organizations"
  add_foreign_key "analytics_events", "analytics_devices"
  add_foreign_key "analytics_events", "analytics_page_hits"
  add_foreign_key "analytics_events", "analytics_sessions"
  add_foreign_key "analytics_organization_users", "analytics_organizations"
  add_foreign_key "analytics_organization_users", "analytics_users"
  add_foreign_key "analytics_organizations", "swishjam_organizations"
  add_foreign_key "analytics_page_hits", "analytics_devices"
  add_foreign_key "analytics_page_hits", "analytics_sessions"
  add_foreign_key "analytics_sessions", "analytics_devices"
  add_foreign_key "analytics_sessions", "analytics_organizations"
  add_foreign_key "analytics_users", "swishjam_organizations"
  add_foreign_key "swishjam_data_syncs", "swishjam_organizations"
  add_foreign_key "swishjam_integrations", "swishjam_organizations"
  add_foreign_key "swishjam_organization_users", "swishjam_organizations"
  add_foreign_key "swishjam_organization_users", "swishjam_users"
  add_foreign_key "swishjam_sessions", "swishjam_users"
end
