# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# clickhouse:schema:load`. When creating a new database, `rails clickhouse:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ClickhouseActiverecord::Schema.define(version: 2023_08_25_161953) do

  # TABLE: billing_data_snapshots
  # SQL: CREATE TABLE swishjam_analytics_dev.billing_data_snapshots ( `swishjam_api_key` String, `captured_at` DateTime, `mrr_in_cents` UInt32, `total_revenue_in_cents` UInt32, `num_active_subscriptions` UInt32, `num_free_trial_subscriptions` UInt32, `num_canceled_subscriptions` UInt32 ) ENGINE = MergeTree ORDER BY (swishjam_api_key, captured_at) SETTINGS index_granularity = 8192
  create_table "billing_data_snapshots", id: false, options: "MergeTree ORDER BY (swishjam_api_key, captured_at) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "swishjam_api_key", null: false
    t.datetime "captured_at", null: false
    t.integer "mrr_in_cents", null: false
    t.integer "total_revenue_in_cents", null: false
    t.integer "num_active_subscriptions", null: false
    t.integer "num_free_trial_subscriptions", null: false
    t.integer "num_canceled_subscriptions", null: false
  end

  # TABLE: events
  # SQL: CREATE TABLE swishjam_analytics_dev.events ( `swishjam_api_key` String, `uuid` String, `device_identifier` String, `session_identifier` String, `swishjam_organization_id` Nullable(String), `name` String, `properties` String, `occurred_at` DateTime, `ingested_at` DateTime ) ENGINE = MergeTree ORDER BY (swishjam_api_key, occurred_at) SETTINGS index_granularity = 8192
  create_table "events", id: false, options: "MergeTree ORDER BY (swishjam_api_key, occurred_at) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "swishjam_api_key", null: false
    t.string "uuid", null: false
    t.string "device_identifier", null: false
    t.string "session_identifier", null: false
    t.string "swishjam_organization_id"
    t.string "name", null: false
    t.string "properties", null: false
    t.datetime "occurred_at", null: false
    t.datetime "ingested_at", null: false
  end

  # TABLE: user_identify_events
  # SQL: CREATE TABLE swishjam_analytics_dev.user_identify_events ( `swishjam_api_key` String, `device_identifier` String, `swishjam_user_id` String, `occurred_at` DateTime, `ingested_at` DateTime ) ENGINE = MergeTree ORDER BY (swishjam_api_key, occurred_at) SETTINGS index_granularity = 8192
  create_table "user_identify_events", id: false, options: "MergeTree ORDER BY (swishjam_api_key, occurred_at) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "swishjam_api_key", null: false
    t.string "device_identifier", null: false
    t.string "swishjam_user_id", null: false
    t.datetime "occurred_at", null: false
    t.datetime "ingested_at", null: false
  end

end
