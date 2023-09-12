class BrowserCountsByStartingUrlAndHour < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      create table browser_counts_by_analytics_family_and_hour (
        `swishjam_api_key` LowCardinality(String),
        `count` UInt32,
        `browser_name` LowCardinality(String),
        `analytics_family` Enum('marketing', 'product', 'other') DEFAULT 'other',
        `occurred_at` DateTime,
        `calculated_at` DateTime DEFAULT now()
      )
      ENGINE = SummingMergeTree()
      PRIMARY KEY (swishjam_api_key, analytics_family, browser_name, occurred_at)
      ORDER BY (swishjam_api_key, analytics_family, browser_name, occurred_at)
    SQL

    execute <<~SQL
      CREATE MATERIALIZED VIEW browser_counts_by_analytics_family_and_hour_mv TO browser_counts_by_analytics_family_and_hour AS
      SELECT
        swishjam_api_key,
        count() AS count,
        if(JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.ANALYTICS_FAMILY}') = '', 'other', JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.ANALYTICS_FAMILY}')) AS analytics_family,
        JSONExtractString(properties, 'browser_name') AS browser_name,
        toStartOfHour(occurred_at) AS occurred_at
      FROM events
      WHERE name = '#{Analytics::Event::ReservedNames.NEW_SESSION}'
      GROUP BY swishjam_api_key, analytics_family, browser_name, occurred_at
    SQL
  end
end
