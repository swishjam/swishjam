class CreateSessionTimeseriesTables < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      CREATE TABLE session_counts_by_analytics_family_and_hour (
        `swishjam_api_key` LowCardinality(String),
        `count` UInt32,
        `analytics_family` Enum('marketing', 'product', 'other') DEFAULT 'other',
        `occurred_at` DateTime,
        `calculated_at` DateTime DEFAULT now()
      )
      ENGINE = SummingMergeTree()
      PRIMARY KEY (swishjam_api_key, analytics_family, occurred_at)
      ORDER BY (swishjam_api_key, analytics_family, occurred_at)
    SQL

    execute <<~SQL
      CREATE MATERIALIZED VIEW session_counts_by_analytics_family_and_hour_mv TO session_counts_by_analytics_family_and_hour AS
      SELECT
        swishjam_api_key,
        count(DISTINCT(JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER}'))) AS count,
        if(JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.ANALYTICS_FAMILY}') = '', 'other', JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.ANALYTICS_FAMILY}')) AS analytics_family,
        toStartOfHour(occurred_at) AS occurred_at
      FROM events
      WHERE name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}'
      GROUP BY swishjam_api_key, analytics_family, occurred_at
    SQL
  end

  def down
    execute('DROP TABLE IF EXISTS session_counts_by_analytics_family_and_hour')
    execute('DROP TABLE IF EXISTS session_counts_by_analytics_family_and_hour_mv')
  end
end
