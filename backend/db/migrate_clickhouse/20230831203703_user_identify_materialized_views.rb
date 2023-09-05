class UserIdentifyMaterializedViews < ActiveRecord::Migration[6.1]
#   def up
#     # CREATE TABLE hackernews_views_vcmt (
#     #   id UInt32,
#     #   author String,
#     #   views UInt64,
#     #   sign Int8,
#     #   version UInt32
#     # )
#     # ENGINE = VersionedCollapsingMergeTree(sign, version)
#     # PRIMARY KEY (id, author)
#     execute <<~SQL
#       CREATE TABLE IF NOT EXISTS most_recent_user_identifies_by_device (
#         `swishjam_api_key` LowCardinality(String),
#         `device_identifier` String,
#         `swishjam_user_id` String,
#         `occurred_at` DateTime,
#         `sign` Int8
#       )
#       ENGINE = VersionedCollapsingMergeTree(sign, occurred_at)
#       PRIMARY KEY (swishjam_api_key, device_identifier)
#     SQL
#   end

#   def down
#     execute <<~SQL
#       DROP TABLE IF EXISTS most_recent_user_identifies_by_device

#         INSERT INTO most_recent_user_identifies_by_device(swishjam_api_key, device_identifier, sign) VALUES ('swish_1', 'device_1',)
#       SQL

#       # SELECT
#       #   id,
#       #   author,
#       #   sum(views * sign)
#       # FROM hackernews_views_vcmt
#       # GROUP BY (id, author)
#       # HAVING sum(sign) > 0
#       # ORDER BY id ASC
#   end
end
