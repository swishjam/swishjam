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

ClickhouseActiverecord::Schema.define(version: 2023_09_08_173035) do

  # TABLE: browser_counts_by_analytics_family_and_hour
  # SQL: CREATE TABLE swishjam_analytics_test.browser_counts_by_analytics_family_and_hour ( `swishjam_api_key` LowCardinality(String), `count` UInt32, `browser_name` LowCardinality(String), `analytics_family` Enum8('marketing' = 1, 'product' = 2, 'other' = 3) DEFAULT 'other', `occurred_at` DateTime, `calculated_at` DateTime DEFAULT now() ) ENGINE = SummingMergeTree PRIMARY KEY (swishjam_api_key, analytics_family, browser_name, occurred_at) ORDER BY (swishjam_api_key, analytics_family, browser_name, occurred_at) SETTINGS index_granularity = 8192
# Could not dump table "browser_counts_by_analytics_family_and_hour" because of following StandardError
#   Unknown type 'Enum8('marketing' = 1, 'product' = 2, 'other' = 3)' for column 'analytics_family'

  # TABLE: events
  # SQL: CREATE TABLE swishjam_analytics_test.events ( `uuid` String, `swishjam_api_key` LowCardinality(String), `name` LowCardinality(String), `ingested_at` DateTime, `occurred_at` DateTime, `properties` String ) ENGINE = MergeTree PRIMARY KEY (swishjam_api_key, name) ORDER BY (swishjam_api_key, name, occurred_at) SETTINGS index_granularity = 8192
  create_table "events", id: false, options: "MergeTree PRIMARY KEY (swishjam_api_key, name) ORDER BY (swishjam_api_key, name, occurred_at) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "uuid", null: false
    t.string "swishjam_api_key", null: false
    t.string "name", null: false
    t.datetime "ingested_at", null: false
    t.datetime "occurred_at", null: false
    t.string "properties", null: false
  end

  # TABLE: page_view_counts_by_hour
  # SQL: CREATE TABLE swishjam_analytics_test.page_view_counts_by_hour ( `swishjam_api_key` LowCardinality(String), `count` UInt32, `analytics_family` Enum8('marketing' = 1, 'product' = 2, 'other' = 3) DEFAULT 'other', `url_host` LowCardinality(String), `url_path` LowCardinality(String), `occurred_at` DateTime, `calculated_at` DateTime DEFAULT now() ) ENGINE = SummingMergeTree PRIMARY KEY (swishjam_api_key, analytics_family, occurred_at) ORDER BY (swishjam_api_key, analytics_family, occurred_at) SETTINGS index_granularity = 8192
# Could not dump table "page_view_counts_by_hour" because of following StandardError
#   Unknown type 'Enum8('marketing' = 1, 'product' = 2, 'other' = 3)' for column 'analytics_family'

  # TABLE: page_views
  # SQL: CREATE TABLE swishjam_analytics_test.page_views ( `uuid` String, `swishjam_api_key` LowCardinality(String), `session_identifier` String, `page_view_identifier` String, `analytics_family` Enum8('marketing' = 1, 'product' = 2, 'other' = 3) DEFAULT 'other', `url` String, `url_host` LowCardinality(String), `url_path` LowCardinality(String), `url_query` String, `referrer` String, `referrer_host` LowCardinality(String), `referrer_path` LowCardinality(String), `referrer_query` String, `occurred_at` DateTime ) ENGINE = MergeTree PRIMARY KEY (swishjam_api_key, analytics_family, url_host, url_path, session_identifier, occurred_at) ORDER BY (swishjam_api_key, analytics_family, url_host, url_path, session_identifier, occurred_at) SETTINGS index_granularity = 8192
# Could not dump table "page_views" because of following StandardError
#   Unknown type 'Enum8('marketing' = 1, 'product' = 2, 'other' = 3)' for column 'analytics_family'

  # TABLE: session_counts_by_analytics_family_and_hour
  # SQL: CREATE TABLE swishjam_analytics_test.session_counts_by_analytics_family_and_hour ( `swishjam_api_key` LowCardinality(String), `count` UInt32, `analytics_family` Enum8('marketing' = 1, 'product' = 2, 'other' = 3) DEFAULT 'other', `occurred_at` DateTime, `calculated_at` DateTime DEFAULT now() ) ENGINE = SummingMergeTree PRIMARY KEY (swishjam_api_key, analytics_family, occurred_at) ORDER BY (swishjam_api_key, analytics_family, occurred_at) SETTINGS index_granularity = 8192
# Could not dump table "session_counts_by_analytics_family_and_hour" because of following StandardError
#   Unknown type 'Enum8('marketing' = 1, 'product' = 2, 'other' = 3)' for column 'analytics_family'

  # TABLE: session_referrer_counts_by_analytics_family_and_hour
  # SQL: CREATE TABLE swishjam_analytics_test.session_referrer_counts_by_analytics_family_and_hour ( `swishjam_api_key` LowCardinality(String), `count` UInt32, `analytics_family` Enum8('marketing' = 1, 'product' = 2, 'other' = 3) DEFAULT 'other', `referrer_url_host` String, `referrer_url_path` String, `occurred_at` DateTime, `calculated_at` DateTime DEFAULT now() ) ENGINE = SummingMergeTree PRIMARY KEY (swishjam_api_key, analytics_family, occurred_at) ORDER BY (swishjam_api_key, analytics_family, occurred_at) SETTINGS index_granularity = 8192
# Could not dump table "session_referrer_counts_by_analytics_family_and_hour" because of following StandardError
#   Unknown type 'Enum8('marketing' = 1, 'product' = 2, 'other' = 3)' for column 'analytics_family'

  # TABLE: user_identify_events
  # SQL: CREATE TABLE swishjam_analytics_test.user_identify_events ( `uuid` String, `swishjam_api_key` LowCardinality(String), `device_identifier` String, `swishjam_user_id` String, `occurred_at` DateTime, `ingested_at` DateTime ) ENGINE = ReplacingMergeTree PRIMARY KEY (swishjam_api_key, device_identifier) ORDER BY (swishjam_api_key, device_identifier) SETTINGS index_granularity = 8192
  create_table "user_identify_events", id: false, options: "ReplacingMergeTree PRIMARY KEY (swishjam_api_key, device_identifier) ORDER BY (swishjam_api_key, device_identifier) SETTINGS index_granularity = 8192", force: :cascade do |t|
    t.string "uuid", null: false
    t.string "swishjam_api_key", null: false
    t.string "device_identifier", null: false
    t.string "swishjam_user_id", null: false
    t.datetime "occurred_at", null: false
    t.datetime "ingested_at", null: false
  end

  # TABLE: browser_counts_by_analytics_family_and_hour_mv
  # SQL: CREATE MATERIALIZED VIEW swishjam_analytics_test.browser_counts_by_analytics_family_and_hour_mv TO swishjam_analytics_test.browser_counts_by_analytics_family_and_hour ( `swishjam_api_key` LowCardinality(String), `count` UInt64, `analytics_family` String, `browser_name` String, `occurred_at` DateTime ) AS SELECT swishjam_api_key, count() AS count, if(JSONExtractString(properties, 'analytics_family') = '', 'other', JSONExtractString(properties, 'analytics_family')) AS analytics_family, JSONExtractString(properties, 'browser_name') AS browser_name, toStartOfHour(occurred_at) AS occurred_at FROM swishjam_analytics_test.events WHERE name = 'new_session' GROUP BY swishjam_api_key, analytics_family, browser_name, occurred_at
  create_table "browser_counts_by_analytics_family_and_hour_mv", view: true, materialized: true, id: false, as: "SELECT swishjam_api_key, count() AS count, if(JSONExtractString(properties, 'analytics_family') = '', 'other', JSONExtractString(properties, 'analytics_family')) AS analytics_family, JSONExtractString(properties, 'browser_name') AS browser_name, toStartOfHour(occurred_at) AS occurred_at FROM swishjam_analytics_test.events WHERE name = 'new_session' GROUP BY swishjam_api_key, analytics_family, browser_name, occurred_at", force: :cascade do |t|
  end

  # TABLE: session_referrer_counts_by_analytics_family_and_hour_mv
  # SQL: CREATE MATERIALIZED VIEW swishjam_analytics_test.session_referrer_counts_by_analytics_family_and_hour_mv TO swishjam_analytics_test.session_referrer_counts_by_analytics_family_and_hour ( `swishjam_api_key` LowCardinality(String), `count` UInt64, `analytics_family` String, `referrer_url_host` String, `referrer_url_path` String, `occurred_at` DateTime ) AS SELECT swishjam_api_key, countDistinct(JSONExtractString(properties, 'session_identifier')) AS count, if(JSONExtractString(properties, 'analytics_family') = '', 'other', JSONExtractString(properties, 'analytics_family')) AS analytics_family, domain(JSONExtractString(properties, 'referrer')) AS referrer_url_host, path(JSONExtractString(properties, 'referrer')) AS referrer_url_path, toStartOfHour(occurred_at) AS occurred_at FROM swishjam_analytics_test.events GROUP BY swishjam_api_key, analytics_family, referrer_url_host, referrer_url_path, occurred_at
  create_table "session_referrer_counts_by_analytics_family_and_hour_mv", view: true, materialized: true, id: false, as: "SELECT swishjam_api_key, countDistinct(JSONExtractString(properties, 'session_identifier')) AS count, if(JSONExtractString(properties, 'analytics_family') = '', 'other', JSONExtractString(properties, 'analytics_family')) AS analytics_family, domain(JSONExtractString(properties, 'referrer')) AS referrer_url_host, path(JSONExtractString(properties, 'referrer')) AS referrer_url_path, toStartOfHour(occurred_at) AS occurred_at FROM swishjam_analytics_test.events GROUP BY swishjam_api_key, analytics_family, referrer_url_host, referrer_url_path, occurred_at", force: :cascade do |t|
  end

  # TABLE: page_view_counts_by_hour_mv
  # SQL: CREATE MATERIALIZED VIEW swishjam_analytics_test.page_view_counts_by_hour_mv TO swishjam_analytics_test.page_view_counts_by_hour ( `swishjam_api_key` LowCardinality(String), `count` UInt64, `analytics_family` String, `occurred_at` DateTime, `url_host` String, `url_path` String ) AS SELECT swishjam_api_key, count() AS count, if(JSONExtractString(properties, 'analytics_family') = '', 'other', JSONExtractString(properties, 'analytics_family')) AS analytics_family, toStartOfHour(occurred_at) AS occurred_at, domain(JSONExtractString(properties, 'url')) AS url_host, path(JSONExtractString(properties, 'url')) AS url_path FROM swishjam_analytics_test.events WHERE name = 'page_view' GROUP BY swishjam_api_key, analytics_family, url_host, url_path, occurred_at
  create_table "page_view_counts_by_hour_mv", view: true, materialized: true, id: false, as: "SELECT swishjam_api_key, count() AS count, if(JSONExtractString(properties, 'analytics_family') = '', 'other', JSONExtractString(properties, 'analytics_family')) AS analytics_family, toStartOfHour(occurred_at) AS occurred_at, domain(JSONExtractString(properties, 'url')) AS url_host, path(JSONExtractString(properties, 'url')) AS url_path FROM swishjam_analytics_test.events WHERE name = 'page_view' GROUP BY swishjam_api_key, analytics_family, url_host, url_path, occurred_at", force: :cascade do |t|
  end

  # TABLE: session_counts_by_analytics_family_and_hour_mv
  # SQL: CREATE MATERIALIZED VIEW swishjam_analytics_test.session_counts_by_analytics_family_and_hour_mv TO swishjam_analytics_test.session_counts_by_analytics_family_and_hour ( `swishjam_api_key` LowCardinality(String), `count` UInt64, `analytics_family` String, `occurred_at` DateTime ) AS SELECT swishjam_api_key, countDistinct(JSONExtractString(properties, 'session_identifier')) AS count, if(JSONExtractString(properties, 'analytics_family') = '', 'other', JSONExtractString(properties, 'analytics_family')) AS analytics_family, toStartOfHour(occurred_at) AS occurred_at FROM swishjam_analytics_test.events WHERE name = 'page_view' GROUP BY swishjam_api_key, analytics_family, occurred_at
  create_table "session_counts_by_analytics_family_and_hour_mv", view: true, materialized: true, id: false, as: "SELECT swishjam_api_key, countDistinct(JSONExtractString(properties, 'session_identifier')) AS count, if(JSONExtractString(properties, 'analytics_family') = '', 'other', JSONExtractString(properties, 'analytics_family')) AS analytics_family, toStartOfHour(occurred_at) AS occurred_at FROM swishjam_analytics_test.events WHERE name = 'page_view' GROUP BY swishjam_api_key, analytics_family, occurred_at", force: :cascade do |t|
  end

  # TABLE: page_views_mv
  # SQL: CREATE MATERIALIZED VIEW swishjam_analytics_test.page_views_mv TO swishjam_analytics_test.page_views ( `uuid` String, `swishjam_api_key` LowCardinality(String), `analytics_family` String, `session_identifier` String, `page_view_identifier` String, `url` String, `url_host` String, `url_path` String, `url_query` String, `referrer` String, `referrer_host` String, `referrer_path` String, `referrer_query` String, `occurred_at` DateTime ) AS SELECT uuid, swishjam_api_key, if(JSONExtractString(properties, 'analytics_family') = '', 'other', JSONExtractString(properties, 'analytics_family')) AS analytics_family, JSONExtractString(properties, 'session_identifier') AS session_identifier, JSONExtractString(properties, 'page_view_identifier') AS page_view_identifier, JSONExtractString(properties, 'url') AS url, domain(JSONExtractString(properties, 'url')) AS url_host, path(JSONExtractString(properties, 'url')) AS url_path, queryString(JSONExtractString(properties, 'url')) AS url_query, JSONExtractString(properties, 'referrer') AS referrer, domain(JSONExtractString(properties, 'referrer')) AS referrer_host, path(JSONExtractString(properties, 'referrer')) AS referrer_path, queryString(JSONExtractString(properties, 'referrer')) AS referrer_query, occurred_at FROM swishjam_analytics_test.events WHERE name = 'page_view'
  create_table "page_views_mv", view: true, materialized: true, id: false, as: "SELECT uuid, swishjam_api_key, if(JSONExtractString(properties, 'analytics_family') = '', 'other', JSONExtractString(properties, 'analytics_family')) AS analytics_family, JSONExtractString(properties, 'session_identifier') AS session_identifier, JSONExtractString(properties, 'page_view_identifier') AS page_view_identifier, JSONExtractString(properties, 'url') AS url, domain(JSONExtractString(properties, 'url')) AS url_host, path(JSONExtractString(properties, 'url')) AS url_path, queryString(JSONExtractString(properties, 'url')) AS url_query, JSONExtractString(properties, 'referrer') AS referrer, domain(JSONExtractString(properties, 'referrer')) AS referrer_host, path(JSONExtractString(properties, 'referrer')) AS referrer_path, queryString(JSONExtractString(properties, 'referrer')) AS referrer_query, occurred_at FROM swishjam_analytics_test.events WHERE name = 'page_view'", force: :cascade do |t|
  end

end
