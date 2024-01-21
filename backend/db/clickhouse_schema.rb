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

ClickhouseActiverecord::Schema.define(version: 2024_01_21_190718) do

  # TABLE: billing_data_snapshots
  # SQL: CREATE TABLE swishjam_analytics_dev.billing_data_snapshots ( `swishjam_api_key` LowCardinality(String), `mrr_in_cents` UInt32, `total_revenue_in_cents` UInt32, `num_active_subscriptions` UInt32, `num_free_trial_subscriptions` UInt32, `num_canceled_subscriptions` UInt32, `captured_at` DateTime, `num_paid_subscriptions` Nullable(Int32), `num_customers_with_paid_subscriptions` UInt32 DEFAULT 0 ) ENGINE = MergeTree PRIMARY KEY (swishjam_api_key, captured_at) ORDER BY (swishjam_api_key, captured_at) SETTINGS index_granularity = 8192
  create_table "billing_data_snapshots", id: false, options: "MergeTree PRIMARY KEY (swishjam_api_key, captured_at) ORDER BY (swishjam_api_key, captured_at) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "swishjam_api_key", null: false
    t.integer "mrr_in_cents", null: false
    t.integer "total_revenue_in_cents", null: false
    t.integer "num_active_subscriptions", null: false
    t.integer "num_free_trial_subscriptions", null: false
    t.integer "num_canceled_subscriptions", null: false
    t.datetime "captured_at", null: false
    t.integer "num_paid_subscriptions", unsigned: false
    t.integer "num_customers_with_paid_subscriptions", null: false
  end

  # TABLE: customer_billing_data_snapshots
  # SQL: CREATE TABLE swishjam_analytics_dev.customer_billing_data_snapshots ( `swishjam_api_key` LowCardinality(String), `swishjam_owner_id` String, `swishjam_owner_type` Enum8('user' = 1, 'organization' = 2), `mrr_in_cents` UInt64, `total_revenue_in_cents` UInt64, `captured_at` DateTime DEFAULT now() ) ENGINE = MergeTree PRIMARY KEY (swishjam_owner_type, swishjam_api_key, swishjam_owner_id) ORDER BY (swishjam_owner_type, swishjam_api_key, swishjam_owner_id) SETTINGS index_granularity = 8192
# Could not dump table "customer_billing_data_snapshots" because of following StandardError
#   Unknown type 'Enum8('user' = 1, 'organization' = 2)' for column 'swishjam_owner_type'

  # TABLE: events
  # SQL: CREATE TABLE swishjam_analytics_dev.events ( `uuid` String, `swishjam_api_key` LowCardinality(String), `name` LowCardinality(String), `user_profile_id` UUID, `properties` String, `user_properties` String, `ingested_at` DateTime64(3, 'UTC') DEFAULT now(), `occurred_at` DateTime64(3, 'UTC') ) ENGINE = ReplacingMergeTree(occurred_at) PRIMARY KEY (swishjam_api_key, name, occurred_at) ORDER BY (swishjam_api_key, name, occurred_at, uuid) SETTINGS index_granularity = 8192
# Could not dump table "events" because of following StandardError
#   Unknown type 'UUID' for column 'user_profile_id'

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

  # TABLE: revenue_monthly_retention_periods
  # SQL: CREATE TABLE swishjam_analytics_dev.revenue_monthly_retention_periods ( `workspace_id` LowCardinality(String), `cohort_date` Date, `cohort_starting_mrr_in_cents` Int32, `cohort_starting_num_subscriptions` Int32, `retention_period_date` Date, `retention_period_mrr_in_cents` Int32, `retention_period_num_subscriptions` Int32, `calculated_at` DateTime DEFAULT now() ) ENGINE = ReplacingMergeTree PRIMARY KEY (workspace_id, cohort_date, retention_period_date) ORDER BY (workspace_id, cohort_date, retention_period_date) SETTINGS index_granularity = 8192
  create_table "revenue_monthly_retention_periods", id: false, options: "ReplacingMergeTree PRIMARY KEY (workspace_id, cohort_date, retention_period_date) ORDER BY (workspace_id, cohort_date, retention_period_date) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "workspace_id", null: false
    t.date "cohort_date", null: false
    t.integer "cohort_starting_mrr_in_cents", unsigned: false, null: false
    t.integer "cohort_starting_num_subscriptions", unsigned: false, null: false
    t.date "retention_period_date", null: false
    t.integer "retention_period_mrr_in_cents", unsigned: false, null: false
    t.integer "retention_period_num_subscriptions", unsigned: false, null: false
    t.datetime "calculated_at", default: -> { "now()" }, null: false
  end

  # TABLE: swishjam_organization_members
  # SQL: CREATE TABLE swishjam_analytics_dev.swishjam_organization_members ( `swishjam_api_key` LowCardinality(String), `workspace_id` String, `swishjam_organization_id` String, `swishjam_user_id` String, `created_at` DateTime ) ENGINE = ReplacingMergeTree(created_at) PRIMARY KEY (workspace_id, swishjam_api_key) ORDER BY (workspace_id, swishjam_api_key, swishjam_organization_id, swishjam_user_id) SETTINGS index_granularity = 8192
  create_table "swishjam_organization_members", id: false, options: "ReplacingMergeTree(created_at) PRIMARY KEY (workspace_id, swishjam_api_key) ORDER BY (workspace_id, swishjam_api_key, swishjam_organization_id, swishjam_user_id) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "swishjam_api_key", null: false
    t.string "workspace_id", null: false
    t.string "swishjam_organization_id", null: false
    t.string "swishjam_user_id", null: false
    t.datetime "created_at", null: false
  end

  # TABLE: swishjam_organization_profiles
  # SQL: CREATE TABLE swishjam_analytics_dev.swishjam_organization_profiles ( `swishjam_api_key` LowCardinality(String), `workspace_id` String, `swishjam_organization_id` String, `organization_unique_identifier` Nullable(String), `name` Nullable(String), `lifetime_value_in_cents` Int64, `monthly_recurring_revenue_in_cents` Int64, `current_subscription_plan_name` Nullable(String), `metadata` String, `last_updated_from_transactional_db_at` Nullable(DateTime), `created_at` DateTime, `updated_at` DateTime ) ENGINE = ReplacingMergeTree(updated_at) PRIMARY KEY (workspace_id, swishjam_api_key) ORDER BY (workspace_id, swishjam_api_key, swishjam_organization_id) SETTINGS index_granularity = 8192
  create_table "swishjam_organization_profiles", id: false, options: "ReplacingMergeTree(updated_at) PRIMARY KEY (workspace_id, swishjam_api_key) ORDER BY (workspace_id, swishjam_api_key, swishjam_organization_id) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "swishjam_api_key", null: false
    t.string "workspace_id", null: false
    t.string "swishjam_organization_id", null: false
    t.string "organization_unique_identifier"
    t.string "name"
    t.integer "lifetime_value_in_cents", unsigned: false, limit: 8, null: false
    t.integer "monthly_recurring_revenue_in_cents", unsigned: false, limit: 8, null: false
    t.string "current_subscription_plan_name"
    t.string "metadata", null: false
    t.datetime "last_updated_from_transactional_db_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  # TABLE: swishjam_user_profiles
  # SQL: CREATE TABLE swishjam_analytics_dev.swishjam_user_profiles ( `swishjam_api_key` LowCardinality(String), `workspace_id` String, `swishjam_user_id` String, `user_unique_identifier` Nullable(String), `email` Nullable(String), `first_name` Nullable(String), `last_name` Nullable(String), `full_name` Nullable(String), `gravatar_url` String, `lifetime_value_in_cents` Int64, `monthly_recurring_revenue_in_cents` Int64, `current_subscription_plan_name` Nullable(String), `created_by_data_source` LowCardinality(String), `initial_landing_page_url` Nullable(String), `initial_referrer_url` Nullable(String), `metadata` String, `enrichment_match_likelihood` Nullable(Int8), `enrichment_first_name` Nullable(String), `enrichment_last_name` Nullable(String), `enrichment_linkedin_url` Nullable(String), `enrichment_twitter_url` Nullable(String), `enrichment_github_url` Nullable(String), `enrichment_personal_email` Nullable(String), `enrichment_industry` Nullable(String), `enrichment_job_title` Nullable(String), `enrichment_company_name` Nullable(String), `enrichment_company_website` Nullable(String), `enrichment_company_size` Nullable(String), `enrichment_year_company_founded` Nullable(String), `enrichment_company_industry` Nullable(String), `enrichment_company_linkedin_url` Nullable(String), `enrichment_company_twitter_url` Nullable(String), `enrichment_company_location_metro` Nullable(String), `enrichment_company_location_geo_coordinates` Nullable(String), `first_seen_at_in_web_app` Nullable(DateTime), `last_updated_from_transactional_db_at` Nullable(DateTime), `created_at` DateTime, `updated_at` DateTime, `merged_into_swishjam_user_id` Nullable(UUID) ) ENGINE = ReplacingMergeTree(updated_at) PRIMARY KEY (workspace_id, swishjam_api_key) ORDER BY (workspace_id, swishjam_api_key, swishjam_user_id) SETTINGS index_granularity = 8192
# Could not dump table "swishjam_user_profiles" because of following StandardError
#   Unknown type 'Nullable(UUID)' for column 'merged_into_swishjam_user_id'

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
