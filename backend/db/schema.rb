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

ActiveRecord::Schema.define(version: 2023_08_09_195719) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "analytics_billing_data_snapshots", force: :cascade do |t|
    t.bigint "instance_id"
    t.integer "mrr_in_cents"
    t.integer "total_revenue_in_cents"
    t.integer "num_active_subscriptions"
    t.integer "num_free_trial_subscriptions"
    t.integer "num_canceled_subscriptions"
    t.datetime "captured_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["instance_id"], name: "index_analytics_billing_data_snapshots_on_instance_id"
  end

  create_table "analytics_customer_billing_data_snapshots", force: :cascade do |t|
    t.bigint "instance_id", null: false
    t.string "customer_email"
    t.string "customer_name"
    t.integer "mrr_in_cents"
    t.integer "total_revenue_in_cents"
    t.datetime "captured_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["instance_id"], name: "index_analytics_customer_billing_data_snapshots_on_instance_id"
  end

  create_table "analytics_customer_subscriptions", force: :cascade do |t|
    t.bigint "instance_id", null: false
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
    t.index ["instance_id"], name: "index_analytics_customer_subscriptions_on_instance_id"
  end

  create_table "analytics_devices", force: :cascade do |t|
    t.bigint "instance_id"
    t.bigint "user_id"
    t.string "fingerprint"
    t.string "user_agent"
    t.string "browser"
    t.string "browser_version"
    t.string "os"
    t.string "os_version"
    t.string "device"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["fingerprint"], name: "index_analytics_devices_on_fingerprint"
    t.index ["instance_id"], name: "index_analytics_devices_on_instance_id"
    t.index ["user_id"], name: "index_analytics_devices_on_user_id"
  end

  create_table "analytics_events", force: :cascade do |t|
    t.bigint "device_id"
    t.bigint "session_id"
    t.bigint "page_hit_id"
    t.string "name"
    t.datetime "timestamp"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["device_id"], name: "index_analytics_events_on_device_id"
    t.index ["page_hit_id"], name: "index_analytics_events_on_page_hit_id"
    t.index ["session_id"], name: "index_analytics_events_on_session_id"
  end

  create_table "analytics_metadata", force: :cascade do |t|
    t.string "parent_type"
    t.bigint "parent_id"
    t.string "key"
    t.string "value"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["parent_type", "parent_id"], name: "index_metadata_on_parent"
  end

  create_table "analytics_organization_users", force: :cascade do |t|
    t.bigint "organization_id"
    t.bigint "user_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["organization_id"], name: "index_analytics_organization_users_on_organization_id"
    t.index ["user_id"], name: "index_analytics_organization_users_on_user_id"
  end

  create_table "analytics_organizations", force: :cascade do |t|
    t.bigint "instance_id"
    t.string "name"
    t.string "unique_identifier"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["instance_id"], name: "index_analytics_organizations_on_instance_id"
    t.index ["unique_identifier"], name: "index_analytics_organizations_on_unique_identifier"
  end

  create_table "analytics_page_hits", force: :cascade do |t|
    t.bigint "device_id"
    t.bigint "session_id"
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
    t.index ["device_id"], name: "index_analytics_page_hits_on_device_id"
    t.index ["session_id"], name: "index_analytics_page_hits_on_session_id"
    t.index ["unique_identifier"], name: "index_analytics_page_hits_on_unique_identifier"
  end

  create_table "analytics_payments", force: :cascade do |t|
    t.bigint "instance_id", null: false
    t.string "payment_processor"
    t.string "provider_id"
    t.string "customer_email"
    t.string "customer_name"
    t.integer "amount_in_cents"
    t.datetime "charged_at"
    t.string "status"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["instance_id"], name: "index_analytics_payments_on_instance_id"
  end

  create_table "analytics_sessions", force: :cascade do |t|
    t.bigint "organization_id"
    t.bigint "device_id"
    t.string "unique_identifier"
    t.datetime "start_time"
    t.datetime "end_time"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["device_id"], name: "index_analytics_sessions_on_device_id"
    t.index ["organization_id"], name: "index_analytics_sessions_on_organization_id"
    t.index ["unique_identifier"], name: "index_analytics_sessions_on_unique_identifier"
  end

  create_table "analytics_users", force: :cascade do |t|
    t.bigint "instance_id"
    t.string "unique_identifier"
    t.string "email"
    t.string "first_name"
    t.string "last_name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["instance_id"], name: "index_analytics_users_on_instance_id"
    t.index ["unique_identifier"], name: "index_analytics_users_on_unique_identifier"
  end

  create_table "data_syncs", force: :cascade do |t|
    t.bigint "instance_id", null: false
    t.string "provider", null: false
    t.datetime "started_at"
    t.datetime "completed_at"
    t.integer "duration_in_seconds"
    t.text "error_message"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["instance_id"], name: "index_data_syncs_on_instance_id"
  end

  create_table "instances", force: :cascade do |t|
    t.string "public_key"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["public_key"], name: "index_instances_on_public_key"
  end

  create_table "integrations", force: :cascade do |t|
    t.bigint "instance_id"
    t.string "type"
    t.jsonb "config"
    t.boolean "enabled"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["instance_id"], name: "index_integrations_on_instance_id"
  end

  add_foreign_key "analytics_customer_billing_data_snapshots", "instances"
  add_foreign_key "analytics_customer_subscriptions", "instances"
  add_foreign_key "analytics_payments", "instances"
  add_foreign_key "data_syncs", "instances"
end
