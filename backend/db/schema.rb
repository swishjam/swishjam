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

ActiveRecord::Schema.define(version: 2024_02_27_024126) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "analytics_organization_members", force: :cascade do |t|
    t.uuid "analytics_organization_profile_id", null: false
    t.uuid "analytics_user_profile_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["analytics_organization_profile_id"], name: "index_organization_profiles_users_on_org_unique_identifier"
    t.index ["analytics_user_profile_id"], name: "index_organization_profiles_users_on_user_unique_identifier"
  end

  create_table "analytics_organization_profiles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.string "organization_unique_identifier"
    t.string "name"
    t.jsonb "metadata"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "lifetime_value_in_cents", default: 0, null: false
    t.string "domain"
    t.index ["organization_unique_identifier"], name: "index_analytics_organization_profiles_unique_identifier"
    t.index ["workspace_id"], name: "index_analytics_organization_profiles_on_workspace_id"
  end

  create_table "analytics_user_profile_devices", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.uuid "analytics_user_profile_id", null: false
    t.string "device_fingerprint"
    t.string "swishjam_cookie_value"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["analytics_user_profile_id"], name: "idx_user_profile_devices_on_user_profile_id"
    t.index ["device_fingerprint"], name: "index_analytics_user_profile_devices_on_device_fingerprint"
    t.index ["swishjam_cookie_value"], name: "index_analytics_user_profile_devices_on_swishjam_cookie_value"
    t.index ["workspace_id"], name: "index_analytics_user_profile_devices_on_workspace_id"
  end

  create_table "analytics_user_profiles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.string "user_unique_identifier"
    t.string "email"
    t.string "first_name"
    t.string "last_name"
    t.jsonb "metadata"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.jsonb "immutable_metadata", default: {}
    t.string "gravatar_url"
    t.integer "lifetime_value_in_cents", default: 0, null: false
    t.string "created_by_data_source"
    t.text "initial_landing_page_url"
    t.string "initial_referrer_url"
    t.datetime "first_seen_at_in_web_app"
    t.uuid "merged_into_analytics_user_profile_id"
    t.datetime "last_seen_at_in_web_app"
    t.index ["merged_into_analytics_user_profile_id"], name: "idx_user_profiles_on_merged_into_user_profile_id"
    t.index ["user_unique_identifier"], name: "index_analytics_user_profiles_on_user_unique_identifier"
    t.index ["workspace_id"], name: "index_analytics_user_profiles_on_workspace_id"
  end

  create_table "api_keys", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.string "data_source"
    t.string "public_key"
    t.string "private_key"
    t.boolean "enabled"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["data_source"], name: "index_api_keys_on_data_source"
    t.index ["private_key"], name: "index_api_keys_on_private_key", unique: true
    t.index ["public_key"], name: "index_api_keys_on_public_key", unique: true
    t.index ["workspace_id"], name: "index_api_keys_on_workspace_id"
  end

  create_table "auth_sessions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id"
    t.string "jwt_value"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_auth_sessions_on_user_id"
  end

  create_table "automation_steps", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "automation_id", null: false
    t.string "type", null: false
    t.integer "sequence_index", null: false
    t.jsonb "config", default: {}, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["automation_id"], name: "index_automation_steps_on_automation_id"
  end

  create_table "automations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.uuid "created_by_user_id"
    t.string "name", null: false
    t.text "description"
    t.string "entry_point_event_name", null: false
    t.boolean "enabled"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["created_by_user_id"], name: "index_automations_on_created_by_user_id"
    t.index ["workspace_id"], name: "index_automations_on_workspace_id"
  end

  create_table "customer_subscription_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "customer_subscription_id", null: false
    t.string "subscription_provider_object_id", null: false
    t.integer "quantity", null: false
    t.string "product_name", null: false
    t.integer "price_unit_amount", null: false
    t.string "price_nickname"
    t.string "price_billing_scheme", null: false
    t.string "price_recurring_interval", null: false
    t.integer "price_recurring_interval_count", null: false
    t.string "price_recurring_usage_type", null: false
    t.index ["customer_subscription_id"], name: "index_customer_subscription_items_on_customer_subscription_id"
    t.index ["subscription_provider_object_id"], name: "index_customer_sub_items_on_sub_provider_object_id"
  end

  create_table "customer_subscriptions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.string "parent_profile_type", null: false
    t.uuid "parent_profile_id", null: false
    t.string "subscription_provider_object_id", null: false
    t.string "subscription_provider", null: false
    t.string "status", null: false
    t.datetime "canceled_at"
    t.index ["parent_profile_type", "parent_profile_id"], name: "index_customer_subscriptions_on_parent_profile"
    t.index ["status"], name: "index_customer_subscriptions_on_status"
    t.index ["subscription_provider"], name: "index_customer_subscriptions_on_subscription_provider"
    t.index ["subscription_provider_object_id"], name: "index_customer_subscriptions_on_subscription_provider_object_id"
    t.index ["workspace_id"], name: "index_customer_subscriptions_on_workspace_id"
  end

  create_table "dashboard_components", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id"
    t.uuid "created_by_user_id"
    t.jsonb "configuration"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["created_by_user_id"], name: "index_dashboard_components_on_created_by_user_id"
    t.index ["workspace_id"], name: "index_dashboard_components_on_workspace_id"
  end

  create_table "dashboards", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id"
    t.uuid "created_by_user_id"
    t.string "name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["created_by_user_id"], name: "index_dashboards_on_created_by_user_id"
    t.index ["workspace_id"], name: "index_dashboards_on_workspace_id"
  end

  create_table "dashboards_dashboard_components", force: :cascade do |t|
    t.uuid "dashboard_id"
    t.uuid "dashboard_component_id"
    t.index ["dashboard_component_id"], name: "index_dashboards_dashboard_components_on_dashboard_component_id"
    t.index ["dashboard_id", "dashboard_component_id"], name: "index_dashboards_dashboard_components", unique: true
    t.index ["dashboard_id"], name: "index_dashboards_dashboard_components_on_dashboard_id"
  end

  create_table "data_syncs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.string "provider", null: false
    t.datetime "started_at"
    t.datetime "completed_at"
    t.float "duration_in_seconds"
    t.text "error_message"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "synced_object_type"
    t.uuid "synced_object_id"
    t.index ["synced_object_type", "synced_object_id"], name: "index_data_syncs_on_synced_object"
    t.index ["workspace_id"], name: "index_data_syncs_on_workspace_id"
  end

  create_table "do_not_enrich_user_profile_rules", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.string "email_domain", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["workspace_id"], name: "index_do_not_enrich_user_profile_rules_on_workspace_id"
  end

  create_table "enriched_data", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.string "enrichable_type", null: false
    t.uuid "enrichable_id", null: false
    t.string "enrichment_service", null: false
    t.jsonb "data", default: {}
    t.index ["enrichable_type", "enrichable_id"], name: "index_enriched_data_on_enrichable"
    t.index ["workspace_id"], name: "index_enriched_data_on_workspace_id"
  end

  create_table "enrichment_attempts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.string "enrichable_type", null: false
    t.uuid "enrichable_id", null: false
    t.uuid "enriched_data_id"
    t.string "enrichment_service", null: false
    t.jsonb "attempted_payload", default: {}
    t.datetime "attempted_at", default: -> { "now()" }
    t.boolean "successful", default: false
    t.string "error_message"
    t.index ["enrichable_type", "enrichable_id"], name: "index_enrichment_attempts_on_enrichable"
    t.index ["enriched_data_id"], name: "index_enrichment_attempts_on_enriched_data_id"
    t.index ["workspace_id"], name: "index_enrichment_attempts_on_workspace_id"
  end

  create_table "event_trigger_steps", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "event_trigger_id"
    t.string "type"
    t.jsonb "config"
    t.index ["event_trigger_id"], name: "index_event_trigger_steps_on_event_trigger_id"
  end

  create_table "event_triggers", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id"
    t.boolean "enabled"
    t.string "title"
    t.string "event_name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.jsonb "conditional_statements", default: []
    t.uuid "created_by_user_id"
    t.index ["created_by_user_id"], name: "index_event_triggers_on_created_by_user_id"
    t.index ["workspace_id"], name: "index_event_triggers_on_workspace_id"
  end

  create_table "executed_automation_steps", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "executed_automation_id", null: false
    t.uuid "automation_step_id", null: false
    t.jsonb "execution_data", default: {}, null: false
    t.string "error_message"
    t.datetime "started_at"
    t.datetime "completed_at"
    t.index ["automation_step_id"], name: "index_executed_automation_steps_on_automation_step_id"
    t.index ["executed_automation_id"], name: "index_executed_automation_steps_on_executed_automation_id"
  end

  create_table "executed_automations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "automation_id", null: false
    t.uuid "retried_from_executed_automation_id"
    t.uuid "executed_on_user_profile_id"
    t.jsonb "event_json", default: {}, null: false
    t.string "event_uuid", null: false
    t.float "seconds_from_occurred_at_to_executed"
    t.datetime "started_at"
    t.datetime "completed_at"
    t.index ["automation_id"], name: "index_executed_automations_on_automation_id"
    t.index ["event_uuid"], name: "index_executed_automations_on_event_uuid", unique: true
    t.index ["executed_on_user_profile_id"], name: "index_executed_automations_on_executed_on_user_profile_id"
    t.index ["retried_from_executed_automation_id"], name: "idx_executed_automations_on_retried_from_executed_automation_id"
  end

  create_table "ingestion_batches", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "event_type"
    t.float "num_seconds_to_complete"
    t.integer "num_records"
    t.string "error_message"
    t.datetime "started_at"
    t.datetime "completed_at"
    t.integer "num_successful_records"
    t.integer "num_failed_records"
  end

  create_table "integrations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.string "type", null: false
    t.jsonb "config"
    t.boolean "enabled"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["workspace_id"], name: "index_integrations_on_workspace_id"
  end

  create_table "next_automation_step_conditions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "automation_step_id", null: false
    t.uuid "next_automation_step_id", null: false
    t.string "type", null: false
    t.jsonb "config", default: {}, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["automation_step_id"], name: "index_next_automation_step_conditions_on_automation_step_id"
    t.index ["next_automation_step_id"], name: "idx_next_automation_step_conditions_on_next_automation_step_id"
  end

  create_table "profile_tags", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.string "profile_type", null: false
    t.uuid "profile_id", null: false
    t.uuid "applied_by_user_id"
    t.uuid "user_segment_id"
    t.string "name", null: false
    t.datetime "applied_at", default: -> { "now()" }
    t.datetime "removed_at"
    t.index ["applied_by_user_id"], name: "index_profile_tags_on_applied_by_user_id"
    t.index ["name"], name: "index_profile_tags_on_name"
    t.index ["profile_type", "profile_id"], name: "index_profile_tags_on_profile"
    t.index ["user_segment_id"], name: "index_profile_tags_on_user_segment_id"
    t.index ["workspace_id"], name: "index_profile_tags_on_workspace_id"
  end

  create_table "query_filter_groups", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "filterable_type", null: false
    t.uuid "filterable_id", null: false
    t.uuid "parent_query_filter_group_id"
    t.integer "sequence_index", null: false
    t.string "previous_query_filter_group_relationship_operator"
    t.index ["filterable_type", "filterable_id"], name: "index_query_filter_groups_on_filterable"
    t.index ["parent_query_filter_group_id"], name: "index_query_filter_groups_on_parent_query_filter_group_id"
  end

  create_table "query_filters", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "query_filter_group_id", null: false
    t.string "type", null: false
    t.integer "sequence_index", null: false
    t.string "previous_query_filter_relationship_operator"
    t.jsonb "config", null: false
    t.index ["query_filter_group_id"], name: "index_query_filters_on_query_filter_group_id"
  end

  create_table "reports", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id"
    t.boolean "enabled"
    t.string "name"
    t.jsonb "config"
    t.string "sending_mechanism"
    t.string "cadence"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["workspace_id"], name: "index_reports_on_workspace_id"
  end

  create_table "retention_cohort_activity_periods", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.uuid "retention_cohort_id", null: false
    t.integer "num_active_users"
    t.integer "num_periods_after_cohort"
    t.date "time_period"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["retention_cohort_id"], name: "index_retention_cohort_activity_periods_on_retention_cohort_id"
    t.index ["time_period"], name: "index_retention_cohort_activity_periods_on_time_period"
    t.index ["workspace_id"], name: "index_retention_cohort_activity_periods_on_workspace_id"
  end

  create_table "retention_cohorts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.string "time_granularity"
    t.date "time_period"
    t.integer "num_users_in_cohort"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["time_granularity"], name: "index_retention_cohorts_on_time_granularity"
    t.index ["time_period"], name: "index_retention_cohorts_on_time_period"
    t.index ["workspace_id"], name: "index_retention_cohorts_on_workspace_id"
  end

  create_table "slack_connections", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id"
    t.string "access_token"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["workspace_id"], name: "index_slack_connections_on_workspace_id"
  end

  create_table "triggered_event_trigger_steps", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "event_trigger_step_id", null: false
    t.uuid "triggered_event_trigger_id", null: false
    t.jsonb "triggered_payload"
    t.jsonb "triggered_event_json"
    t.string "error_message"
    t.datetime "started_at", null: false
    t.datetime "completed_at"
    t.index ["event_trigger_step_id"], name: "index_triggered_event_trigger_steps_on_event_trigger_step_id"
    t.index ["triggered_event_trigger_id"], name: "idx_triggered_event_trigger_steps_on_triggered_event_trigger_id"
  end

  create_table "triggered_event_triggers", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "event_trigger_id"
    t.uuid "workspace_id"
    t.jsonb "event_json"
    t.float "seconds_from_occurred_at_to_triggered"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "event_uuid"
    t.uuid "retried_triggered_event_trigger_id"
    t.index ["event_trigger_id"], name: "index_triggered_event_triggers_on_event_trigger_id"
    t.index ["retried_triggered_event_trigger_id"], name: "idx_triggered_event_triggers_on_retried_triggered_event_trigger"
    t.index ["workspace_id"], name: "index_triggered_event_triggers_on_workspace_id"
  end

  create_table "triggered_reports", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "report_id"
    t.uuid "workspace_id"
    t.jsonb "payload"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["report_id"], name: "index_triggered_reports_on_report_id"
    t.index ["workspace_id"], name: "index_triggered_reports_on_workspace_id"
  end

  create_table "user_profile_enrichment_attempts", force: :cascade do |t|
    t.uuid "workspace_id"
    t.uuid "analytics_user_profile_id"
    t.uuid "user_profile_enrichment_data_id"
    t.boolean "successful"
    t.string "attempted_payload"
    t.datetime "attempted_at"
    t.text "error_message"
    t.index ["analytics_user_profile_id"], name: "idx_enrichment_attempt_on_user_profile_id"
    t.index ["user_profile_enrichment_data_id"], name: "idx_enrichment_attempt_on_user_enrichment_data_id"
    t.index ["workspace_id"], name: "index_user_profile_enrichment_attempts_on_workspace_id"
  end

  create_table "user_profile_enrichment_data", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id"
    t.uuid "analytics_user_profile_id"
    t.integer "match_likelihood"
    t.string "first_name"
    t.string "last_name"
    t.string "linkedin_url"
    t.string "twitter_url"
    t.string "github_url"
    t.string "work_email"
    t.string "personal_email"
    t.string "industry"
    t.string "job_title"
    t.string "company_name"
    t.string "company_website"
    t.string "company_size"
    t.string "year_company_founded"
    t.string "company_industry"
    t.string "company_linkedin_url"
    t.string "company_twitter_url"
    t.string "company_location_metro"
    t.string "company_location_geo_coordinates"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["analytics_user_profile_id"], name: "index_user_profile_enrichment_data_on_analytics_user_profile_id"
    t.index ["workspace_id"], name: "index_user_profile_enrichment_data_on_workspace_id"
  end

  create_table "user_segments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.uuid "created_by_user_id", null: false
    t.string "name", null: false
    t.string "description"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["created_by_user_id"], name: "index_user_segments_on_created_by_user_id"
    t.index ["workspace_id"], name: "index_user_segments_on_workspace_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "jwt_secret_key", null: false
    t.string "first_name"
    t.string "last_name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["email"], name: "index_users_on_email"
    t.index ["jwt_secret_key"], name: "index_users_on_jwt_secret_key"
  end

  create_table "workspace_invitations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.uuid "invited_by_user_id", null: false
    t.string "invite_token"
    t.string "invited_email"
    t.datetime "accepted_at"
    t.datetime "expires_at"
    t.index ["invited_by_user_id"], name: "index_workspace_invitations_on_invited_by_user_id"
    t.index ["workspace_id"], name: "index_workspace_invitations_on_workspace_id"
  end

  create_table "workspace_members", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.uuid "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_workspace_members_on_user_id"
    t.index ["workspace_id"], name: "index_workspace_members_on_workspace_id"
  end

  create_table "workspace_settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "combine_marketing_and_product_data_sources"
    t.boolean "should_enrich_user_profile_data"
    t.boolean "revenue_analytics_enabled", default: true, null: false
    t.string "enrichment_provider"
    t.boolean "should_enrich_organization_profile_data", default: false
    t.index ["workspace_id"], name: "index_workspace_settings_on_workspace_id"
  end

  create_table "workspaces", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "company_url"
    t.string "public_key", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "should_enrich_user_profile_data"
    t.index ["public_key"], name: "index_workspaces_on_public_key"
  end

  add_foreign_key "analytics_organization_profiles", "workspaces"
  add_foreign_key "analytics_user_profile_devices", "analytics_user_profiles"
  add_foreign_key "analytics_user_profile_devices", "workspaces"
  add_foreign_key "analytics_user_profiles", "workspaces"
  add_foreign_key "api_keys", "workspaces"
  add_foreign_key "auth_sessions", "users"
  add_foreign_key "automation_steps", "automations"
  add_foreign_key "automations", "users", column: "created_by_user_id"
  add_foreign_key "automations", "workspaces"
  add_foreign_key "data_syncs", "workspaces"
  add_foreign_key "executed_automation_steps", "automation_steps"
  add_foreign_key "executed_automation_steps", "executed_automations"
  add_foreign_key "executed_automations", "analytics_user_profiles", column: "executed_on_user_profile_id"
  add_foreign_key "executed_automations", "automations"
  add_foreign_key "executed_automations", "executed_automations", column: "retried_from_executed_automation_id"
  add_foreign_key "integrations", "workspaces"
  add_foreign_key "next_automation_step_conditions", "automation_steps"
  add_foreign_key "next_automation_step_conditions", "automation_steps", column: "next_automation_step_id"
  add_foreign_key "profile_tags", "user_segments"
  add_foreign_key "profile_tags", "users", column: "applied_by_user_id"
  add_foreign_key "profile_tags", "workspaces"
  add_foreign_key "query_filter_groups", "query_filter_groups", column: "parent_query_filter_group_id"
  add_foreign_key "query_filters", "query_filter_groups"
  add_foreign_key "retention_cohort_activity_periods", "retention_cohorts"
  add_foreign_key "retention_cohort_activity_periods", "workspaces"
  add_foreign_key "retention_cohorts", "workspaces"
  add_foreign_key "triggered_event_trigger_steps", "event_trigger_steps"
  add_foreign_key "triggered_event_trigger_steps", "triggered_event_triggers"
  add_foreign_key "triggered_event_triggers", "triggered_event_triggers", column: "retried_triggered_event_trigger_id"
  add_foreign_key "user_segments", "users", column: "created_by_user_id"
  add_foreign_key "user_segments", "workspaces"
  add_foreign_key "workspace_invitations", "workspaces"
  add_foreign_key "workspace_members", "users"
  add_foreign_key "workspace_members", "workspaces"
  add_foreign_key "workspace_settings", "workspaces"
end
