class PageCountsByStartingUrlAndHour < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      create table page_view_counts_by_hour (
        `swishjam_api_key` LowCardinality(String),
        `count` UInt32,
        `analytics_family` Enum('marketing', 'product', 'other') DEFAULT 'other',
        `url_host` LowCardinality(String),
        `url_path` LowCardinality(String),
        `occurred_at` DateTime,
        `calculated_at` DateTime DEFAULT now()
      )
      ENGINE = SummingMergeTree()
      PRIMARY KEY (swishjam_api_key, analytics_family, occurred_at)
      ORDER BY (swishjam_api_key, analytics_family, occurred_at)
    SQL

    execute <<~SQL
      CREATE MATERIALIZED VIEW page_view_counts_by_hour_mv TO page_view_counts_by_hour AS
      SELECT
        swishjam_api_key,
        count() AS count,
        if(JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.ANALYTICS_FAMILY}') = '', 'other', JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.ANALYTICS_FAMILY}')) AS analytics_family,
        toStartOfHour(occurred_at) AS occurred_at,
        domain(JSONExtractString(properties, 'url')) AS url_host,
        path(JSONExtractString(properties, 'url')) AS url_path
      FROM events
      WHERE name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}'
      GROUP BY swishjam_api_key, analytics_family, url_host, url_path, occurred_at
    SQL
  end

  def down
    execute('DROP TABLE IF EXISTS page_view_counts_by_hour')
    execute('DROP TABLE IF EXISTS page_view_counts_by_hour_mv')
  end
end
