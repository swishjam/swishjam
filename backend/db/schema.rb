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

ActiveRecord::Schema.define(version: 2023_10_06_132109) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "analytics_organization_profiles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.string "organization_unique_identifier"
    t.string "name"
    t.jsonb "metadata"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["organization_unique_identifier"], name: "index_analytics_organization_profiles_unique_identifier"
    t.index ["workspace_id"], name: "index_analytics_organization_profiles_on_workspace_id"
  end

  create_table "analytics_organization_profiles_users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "analytics_organization_profile_id", null: false
    t.uuid "analytics_user_profile_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["analytics_organization_profile_id"], name: "index_analytics_organization_profiles_users_organizations"
    t.index ["analytics_user_profile_id"], name: "index_analytics_organization_profiles_users_users"
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

  create_table "data_syncs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.string "provider", null: false
    t.datetime "started_at"
    t.datetime "completed_at"
    t.integer "duration_in_seconds"
    t.text "error_message"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["workspace_id"], name: "index_data_syncs_on_workspace_id"
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

  create_table "workspace_members", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.uuid "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_workspace_members_on_user_id"
    t.index ["workspace_id"], name: "index_workspace_members_on_workspace_id"
  end

  create_table "workspaces", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "company_url"
    t.string "public_key", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["public_key"], name: "index_workspaces_on_public_key"
  end

  add_foreign_key "analytics_organization_profiles", "workspaces"
  add_foreign_key "analytics_organization_profiles_users", "analytics_organization_profiles"
  add_foreign_key "analytics_organization_profiles_users", "analytics_user_profiles"
  add_foreign_key "analytics_user_profiles", "workspaces"
  add_foreign_key "api_keys", "workspaces"
  add_foreign_key "auth_sessions", "users"
  add_foreign_key "data_syncs", "workspaces"
  add_foreign_key "integrations", "workspaces"
  add_foreign_key "retention_cohort_activity_periods", "retention_cohorts"
  add_foreign_key "retention_cohort_activity_periods", "workspaces"
  add_foreign_key "retention_cohorts", "workspaces"
  add_foreign_key "workspace_members", "users"
  add_foreign_key "workspace_members", "workspaces"
end
