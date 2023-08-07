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

ActiveRecord::Schema.define(version: 2023_08_01_220030) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "devices", force: :cascade do |t|
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
    t.index ["fingerprint"], name: "index_devices_on_fingerprint"
    t.index ["instance_id"], name: "index_devices_on_instance_id"
    t.index ["user_id"], name: "index_devices_on_user_id"
  end

  create_table "events", force: :cascade do |t|
    t.bigint "device_id"
    t.bigint "session_id"
    t.bigint "page_hit_id"
    t.string "name"
    t.datetime "timestamp"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["device_id"], name: "index_events_on_device_id"
    t.index ["page_hit_id"], name: "index_events_on_page_hit_id"
    t.index ["session_id"], name: "index_events_on_session_id"
  end

  create_table "instances", force: :cascade do |t|
    t.string "public_key"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["public_key"], name: "index_instances_on_public_key"
  end

  create_table "metadata", force: :cascade do |t|
    t.string "parent_type"
    t.bigint "parent_id"
    t.string "key"
    t.string "value"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["parent_type", "parent_id"], name: "index_metadata_on_parent"
  end

  create_table "organization_users", force: :cascade do |t|
    t.bigint "organization_id"
    t.bigint "user_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["organization_id"], name: "index_organization_users_on_organization_id"
    t.index ["user_id"], name: "index_organization_users_on_user_id"
  end

  create_table "organizations", force: :cascade do |t|
    t.bigint "instance_id"
    t.string "name"
    t.string "unique_identifier"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["instance_id"], name: "index_organizations_on_instance_id"
    t.index ["unique_identifier"], name: "index_organizations_on_unique_identifier"
  end

  create_table "page_hits", force: :cascade do |t|
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
    t.index ["device_id"], name: "index_page_hits_on_device_id"
    t.index ["session_id"], name: "index_page_hits_on_session_id"
    t.index ["unique_identifier"], name: "index_page_hits_on_unique_identifier"
  end

  create_table "sessions", force: :cascade do |t|
    t.bigint "organization_id"
    t.bigint "device_id"
    t.string "unique_identifier"
    t.datetime "start_time"
    t.datetime "end_time"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["device_id"], name: "index_sessions_on_device_id"
    t.index ["organization_id"], name: "index_sessions_on_organization_id"
    t.index ["unique_identifier"], name: "index_sessions_on_unique_identifier"
  end

  create_table "users", force: :cascade do |t|
    t.bigint "instance_id"
    t.string "unique_identifier"
    t.string "email"
    t.string "first_name"
    t.string "last_name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["instance_id"], name: "index_users_on_instance_id"
    t.index ["unique_identifier"], name: "index_users_on_unique_identifier"
  end

end
