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

ClickhouseActiverecord::Schema.define(version: 2023_12_20_012423) do

  # TABLE: billing_data_snapshots
  # SQL: CREATE TABLE swishjam_analytics_dev.billing_data_snapshots ( `swishjam_api_key` LowCardinality(String), `mrr_in_cents` UInt32, `total_revenue_in_cents` UInt32, `num_active_subscriptions` UInt32, `num_free_trial_subscriptions` UInt32, `num_canceled_subscriptions` UInt32, `captured_at` DateTime, `num_paid_subscriptions` Nullable(Int32) ) ENGINE = MergeTree PRIMARY KEY (swishjam_api_key, captured_at) ORDER BY (swishjam_api_key, captured_at) SETTINGS index_granularity = 8192
  create_table "billing_data_snapshots", id: false, options: "MergeTree PRIMARY KEY (swishjam_api_key, captured_at) ORDER BY (swishjam_api_key, captured_at) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "swishjam_api_key", null: false
    t.integer "mrr_in_cents", null: false
    t.integer "total_revenue_in_cents", null: false
    t.integer "num_active_subscriptions", null: false
    t.integer "num_free_trial_subscriptions", null: false
    t.integer "num_canceled_subscriptions", null: false
    t.datetime "captured_at", null: false
    t.integer "num_paid_subscriptions", unsigned: false
  end

  # TABLE: customer_billing_data_snapshots
  # SQL: CREATE TABLE swishjam_analytics_dev.customer_billing_data_snapshots ( `swishjam_api_key` LowCardinality(String), `swishjam_owner_id` String, `swishjam_owner_type` Enum8('user' = 1, 'organization' = 2), `mrr_in_cents` UInt64, `total_revenue_in_cents` UInt64, `captured_at` DateTime DEFAULT now() ) ENGINE = MergeTree PRIMARY KEY (swishjam_owner_type, swishjam_api_key, swishjam_owner_id) ORDER BY (swishjam_owner_type, swishjam_api_key, swishjam_owner_id) SETTINGS index_granularity = 8192
# Could not dump table "customer_billing_data_snapshots" because of following StandardError
#   Unknown type 'Enum8('user' = 1, 'organization' = 2)' for column 'swishjam_owner_type'

  # TABLE: events
  # SQL: CREATE TABLE swishjam_analytics_dev.events ( `uuid` String, `swishjam_api_key` LowCardinality(String), `name` LowCardinality(String), `ingested_at` DateTime DEFAULT now(), `occurred_at` DateTime, `properties` String ) ENGINE = MergeTree PRIMARY KEY (swishjam_api_key, name, occurred_at) ORDER BY (swishjam_api_key, name, occurred_at) SETTINGS index_granularity = 8192
  create_table "events", id: false, options: "MergeTree PRIMARY KEY (swishjam_api_key, name, occurred_at) ORDER BY (swishjam_api_key, name, occurred_at) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "uuid", null: false
    t.string "swishjam_api_key", null: false
    t.string "name", null: false
    t.datetime "ingested_at", default: -> { "now()" }, null: false
    t.datetime "occurred_at", null: false
    t.string "properties", null: false
  end

  # TABLE: organization_identify_events
  # SQL: CREATE TABLE swishjam_analytics_dev.organization_identify_events ( `uuid` String, `swishjam_api_key` LowCardinality(String), `organization_device_identifier` String, `swishjam_organization_id` String, `occurred_at` DateTime, `ingested_at` DateTime DEFAULT now() ) ENGINE = ReplacingMergeTree PRIMARY KEY (swishjam_api_key, organization_device_identifier) ORDER BY (swishjam_api_key, organization_device_identifier) SETTINGS index_granularity = 8192
  create_table "organization_identify_events", id: false, options: "ReplacingMergeTree PRIMARY KEY (swishjam_api_key, organization_device_identifier) ORDER BY (swishjam_api_key, organization_device_identifier) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "uuid", null: false
    t.string "swishjam_api_key", null: false
    t.string "organization_device_identifier", null: false
    t.string "swishjam_organization_id", null: false
    t.datetime "occurred_at", null: false
    t.datetime "ingested_at", default: -> { "now()" }, null: false
  end

  # TABLE: swishjam_organization_profiles
  # SQL: CREATE TABLE swishjam_analytics_dev.swishjam_organization_profiles ( `swishjam_api_key` String, `swishjam_organization_id` String, `unique_identifier` String, `created_at` DateTime ) ENGINE = MergeTree PRIMARY KEY (swishjam_api_key, created_at) ORDER BY (swishjam_api_key, created_at) SETTINGS index_granularity = 8192
  create_table "swishjam_organization_profiles", id: false, options: "MergeTree PRIMARY KEY (swishjam_api_key, created_at) ORDER BY (swishjam_api_key, created_at) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "swishjam_api_key", null: false
    t.string "swishjam_organization_id", null: false
    t.string "unique_identifier", null: false
    t.datetime "created_at", null: false
  end

  # TABLE: swishjam_user_profiles
  # SQL: CREATE TABLE swishjam_analytics_dev.swishjam_user_profiles ( `swishjam_api_key` LowCardinality(String), `workspace_id` String, `swishjam_user_id` String, `user_unique_identifier` Nullable(String), `email` Nullable(String), `first_name` Nullable(String), `last_name` Nullable(String), `full_name` Nullable(String), `gravatar_url` String, `lifetime_value_in_cents` Int64, `monthly_recurring_revenue_in_cents` Int64, `current_subscription_plan_name` Nullable(String), `created_by_data_source` LowCardinality(String), `initial_landing_page_url` Nullable(String), `initial_referrer_url` Nullable(String), `metadata` String, `enrichment_match_likelihood` Nullable(Int8), `enrichment_first_name` Nullable(String), `enrichment_last_name` Nullable(String), `enrichment_linkedin_url` Nullable(String), `enrichment_twitter_url` Nullable(String), `enrichment_github_url` Nullable(String), `enrichment_personal_email` Nullable(String), `enrichment_industry` Nullable(String), `enrichment_job_title` Nullable(String), `enrichment_company_name` Nullable(String), `enrichment_company_website` Nullable(String), `enrichment_company_size` Nullable(String), `enrichment_year_company_founded` Nullable(String), `enrichment_company_industry` Nullable(String), `enrichment_company_linkedin_url` Nullable(String), `enrichment_company_twitter_url` Nullable(String), `enrichment_company_location_metro` Nullable(String), `enrichment_company_location_geo_coordinates` Nullable(String), `first_seen_at_in_web_app` Nullable(DateTime), `last_updated_from_transactional_db_at` Nullable(DateTime), `created_at` DateTime, `updated_at` DateTime ) ENGINE = ReplacingMergeTree(updated_at) PRIMARY KEY (workspace_id, swishjam_api_key) ORDER BY (workspace_id, swishjam_api_key, swishjam_user_id) SETTINGS index_granularity = 8192
  create_table "swishjam_user_profiles", id: false, options: "ReplacingMergeTree(updated_at) PRIMARY KEY (workspace_id, swishjam_api_key) ORDER BY (workspace_id, swishjam_api_key, swishjam_user_id) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "swishjam_api_key", null: false
    t.string "workspace_id", null: false
    t.string "swishjam_user_id", null: false
    t.string "user_unique_identifier"
    t.string "email"
    t.string "first_name"
    t.string "last_name"
    t.string "full_name"
    t.string "gravatar_url", null: false
    t.integer "lifetime_value_in_cents", unsigned: false, limit: 8, null: false
    t.integer "monthly_recurring_revenue_in_cents", unsigned: false, limit: 8, null: false
    t.string "current_subscription_plan_name"
    t.string "created_by_data_source", null: false
    t.string "initial_landing_page_url"
    t.string "initial_referrer_url"
    t.string "metadata", null: false
    t.integer "enrichment_match_likelihood", unsigned: false, limit: 1
    t.string "enrichment_first_name"
    t.string "enrichment_last_name"
    t.string "enrichment_linkedin_url"
    t.string "enrichment_twitter_url"
    t.string "enrichment_github_url"
    t.string "enrichment_personal_email"
    t.string "enrichment_industry"
    t.string "enrichment_job_title"
    t.string "enrichment_company_name"
    t.string "enrichment_company_website"
    t.string "enrichment_company_size"
    t.string "enrichment_year_company_founded"
    t.string "enrichment_company_industry"
    t.string "enrichment_company_linkedin_url"
    t.string "enrichment_company_twitter_url"
    t.string "enrichment_company_location_metro"
    t.string "enrichment_company_location_geo_coordinates"
    t.datetime "first_seen_at_in_web_app"
    t.datetime "last_updated_from_transactional_db_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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
