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

ClickhouseActiverecord::Schema.define(version: 2023_08_31_203703) do

  # TABLE: billing_data_snapshots
  # SQL: CREATE TABLE swishjam_analytics_test.billing_data_snapshots ( `swishjam_api_key` String, `captured_at` DateTime, `mrr_in_cents` UInt32, `total_revenue_in_cents` UInt32, `num_active_subscriptions` UInt32, `num_free_trial_subscriptions` UInt32, `num_canceled_subscriptions` UInt32 ) ENGINE = MergeTree ORDER BY (swishjam_api_key, captured_at) SETTINGS index_granularity = 8192
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
  # SQL: CREATE TABLE swishjam_analytics_test.events ( `swishjam_api_key` String, `uuid` String, `name` String, `device_identifier` Nullable(String), `session_identifier` Nullable(String), `swishjam_organization_id` Nullable(String), `url` Nullable(String), `url_host` Nullable(String), `url_path` Nullable(String), `url_query` Nullable(String), `referrer_url` Nullable(String), `referrer_url_host` Nullable(String), `referrer_url_path` Nullable(String), `referrer_url_query` Nullable(String), `utm_source` Nullable(String), `utm_medium` Nullable(String), `utm_campaign` Nullable(String), `utm_term` Nullable(String), `is_mobile` Nullable(UInt8), `device_type` Nullable(String), `browser` Nullable(String), `browser_version` Nullable(String), `os` Nullable(String), `os_version` Nullable(String), `user_agent` Nullable(String), `properties` String, `occurred_at` DateTime, `ingested_at` DateTime ) ENGINE = MergeTree ORDER BY (swishjam_api_key, name, toMonth(occurred_at)) SETTINGS index_granularity = 8192
  create_table "events", id: false, options: "MergeTree ORDER BY (swishjam_api_key, name, toMonth(occurred_at)) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "swishjam_api_key", null: false
    t.string "uuid", null: false
    t.string "name", null: false
    t.string "device_identifier"
    t.string "session_identifier"
    t.string "swishjam_organization_id"
    t.string "url"
    t.string "url_host"
    t.string "url_path"
    t.string "url_query"
    t.string "referrer_url"
    t.string "referrer_url_host"
    t.string "referrer_url_path"
    t.string "referrer_url_query"
    t.string "utm_source"
    t.string "utm_medium"
    t.string "utm_campaign"
    t.string "utm_term"
    t.integer "is_mobile", limit: 1
    t.string "device_type"
    t.string "browser"
    t.string "browser_version"
    t.string "os"
    t.string "os_version"
    t.string "user_agent"
    t.string "properties", null: false
    t.datetime "occurred_at", null: false
    t.datetime "ingested_at", null: false
  end

  # TABLE: user_identify_events
  # SQL: CREATE TABLE swishjam_analytics_test.user_identify_events ( `swishjam_api_key` String, `uuid` String, `device_identifier` String, `swishjam_user_id` String, `occurred_at` DateTime, `ingested_at` DateTime ) ENGINE = MergeTree ORDER BY (swishjam_api_key, toMonth(occurred_at)) SETTINGS index_granularity = 8192
  create_table "user_identify_events", id: false, options: "MergeTree ORDER BY (swishjam_api_key, toMonth(occurred_at)) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "swishjam_api_key", null: false
    t.string "uuid", null: false
    t.string "device_identifier", null: false
    t.string "swishjam_user_id", null: false
    t.datetime "occurred_at", null: false
    t.datetime "ingested_at", null: false
  end

end
