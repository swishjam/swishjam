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

ClickhouseActiverecord::Schema.define(version: 2023_09_26_202045) do

  # TABLE: billing_data_snapshots
  # SQL: CREATE TABLE swishjam_analytics_dev.billing_data_snapshots ( `swishjam_api_key` LowCardinality(String), `mrr_in_cents` UInt32, `total_revenue_in_cents` UInt32, `num_active_subscriptions` UInt32, `num_free_trial_subscriptions` UInt32, `num_canceled_subscriptions` UInt32, `captured_at` DateTime, `num_paid_subscriptions` UInt32 ) ENGINE = MergeTree PRIMARY KEY (swishjam_api_key, captured_at) ORDER BY (swishjam_api_key, captured_at) SETTINGS index_granularity = 8192
  create_table "billing_data_snapshots", id: false, options: "MergeTree PRIMARY KEY (swishjam_api_key, captured_at) ORDER BY (swishjam_api_key, captured_at) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "swishjam_api_key", null: false
    t.integer "mrr_in_cents", null: false
    t.integer "total_revenue_in_cents", null: false
    t.integer "num_active_subscriptions", null: false
    t.integer "num_free_trial_subscriptions", null: false
    t.integer "num_canceled_subscriptions", null: false
    t.datetime "captured_at", null: false
    t.integer "num_paid_subscriptions", null: false
  end

  # TABLE: customer_billing_data_snapshots
  # SQL: CREATE TABLE swishjam_analytics_dev.customer_billing_data_snapshots ( `swishjam_api_key` LowCardinality(String), `swishjam_owner_id` String, `swishjam_owner_type` Enum8('user' = 1, 'organization' = 2), `mrr_in_cents` UInt64, `total_revenue_in_cents` UInt64, `captured_at` DateTime DEFAULT now() ) ENGINE = MergeTree PRIMARY KEY (swishjam_owner_type, swishjam_api_key, swishjam_owner_id) ORDER BY (swishjam_owner_type, swishjam_api_key, swishjam_owner_id) SETTINGS index_granularity = 8192
# Could not dump table "customer_billing_data_snapshots" because of following StandardError
#   Unknown type 'Enum8('user' = 1, 'organization' = 2)' for column 'swishjam_owner_type'

  # TABLE: events
  # SQL: CREATE TABLE swishjam_analytics_dev.events ( `uuid` String, `swishjam_api_key` LowCardinality(String), `name` LowCardinality(String), `analytics_family` Enum8('marketing' = 1, 'product' = 2, 'other' = 3) DEFAULT 'other', `ingested_at` DateTime DEFAULT now(), `occurred_at` DateTime, `properties` String ) ENGINE = MergeTree ORDER BY (analytics_family, swishjam_api_key, name, occurred_at) SETTINGS index_granularity = 8192
# Could not dump table "events" because of following StandardError
#   Unknown type 'Enum8('marketing' = 1, 'product' = 2, 'other' = 3)' for column 'analytics_family'

  # TABLE: organization_identify_events
  # SQL: CREATE TABLE swishjam_analytics_dev.organization_identify_events ( `uuid` String, `swishjam_api_key` LowCardinality(String), `session_identifier` String, `device_identifier` String, `swishjam_organization_id` String, `occurred_at` DateTime, `ingested_at` DateTime DEFAULT now() ) ENGINE = ReplacingMergeTree PRIMARY KEY (swishjam_api_key, session_identifier) ORDER BY (swishjam_api_key, session_identifier) SETTINGS index_granularity = 8192
  create_table "organization_identify_events", id: false, options: "ReplacingMergeTree PRIMARY KEY (swishjam_api_key, session_identifier) ORDER BY (swishjam_api_key, session_identifier) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "uuid", null: false
    t.string "swishjam_api_key", null: false
    t.string "session_identifier", null: false
    t.string "device_identifier", null: false
    t.string "swishjam_organization_id", null: false
    t.datetime "occurred_at", null: false
    t.datetime "ingested_at", default: -> { "now()" }, null: false
  end

  # TABLE: user_identify_events
  # SQL: CREATE TABLE swishjam_analytics_dev.user_identify_events ( `uuid` String, `swishjam_api_key` LowCardinality(String), `device_identifier` String, `swishjam_user_id` String, `occurred_at` DateTime, `ingested_at` DateTime DEFAULT now() ) ENGINE = ReplacingMergeTree PRIMARY KEY (swishjam_api_key, device_identifier) ORDER BY (swishjam_api_key, device_identifier) SETTINGS index_granularity = 8192
  create_table "user_identify_events", id: false, options: "ReplacingMergeTree PRIMARY KEY (swishjam_api_key, device_identifier) ORDER BY (swishjam_api_key, device_identifier) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "uuid", null: false
    t.string "swishjam_api_key", null: false
    t.string "device_identifier", null: false
    t.string "swishjam_user_id", null: false
    t.datetime "occurred_at", null: false
    t.datetime "ingested_at", default: -> { "now()" }, null: false
  end

end
