class PageViews < ActiveRecord::Migration[6.1]
  def up
    execute('DROP TABLE IF EXISTS page_views')
    execute <<~SQL
      CREATE TABLE page_views (
        `uuid` String,
        `swishjam_api_key` LowCardinality(String),
        `session_identifier` String,
        `page_view_identifier` String,
        `analytics_family` Enum('marketing', 'product', 'other') DEFAULT 'other',
        `url` String,
        `url_host` LowCardinality(String),
        `url_path` LowCardinality(String),
        `url_query` String,
        `referrer` String,
        `referrer_host` LowCardinality(String),
        `referrer_path` LowCardinality(String),
        `referrer_query` String,
        `occurred_at` DateTime
      )
      ENGINE = MergeTree()
      Primary Key (swishjam_api_key, analytics_family, url_host, url_path, session_identifier, occurred_at)
      ORDER BY (swishjam_api_key, analytics_family, url_host, url_path, session_identifier, occurred_at)
    SQL

    execute <<~SQL
      CREATE MATERIALIZED VIEW page_views_mv TO page_views AS
      SELECT
        uuid,
        swishjam_api_key,
        if(JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.ANALYTICS_FAMILY}') = '', 'other', JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.ANALYTICS_FAMILY}')) AS analytics_family,
        JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER}') AS session_identifier,
        JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.PAGE_VIEW_IDENTIFIER}') AS page_view_identifier,
        JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.URL}') AS url,
        domain(JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.URL}')) AS url_host,
        path(JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.URL}')) AS url_path,
        queryString(JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.URL}')) AS url_query,
        JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.REFERRER}') AS referrer,
        domain(JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.REFERRER}')) AS referrer_host,
        path(JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.REFERRER}')) AS referrer_path,
        queryString(JSONExtractString(properties, '#{Analytics::Event::ReservedPropertyNames.REFERRER}')) AS referrer_query,
        occurred_at
      FROM events
      WHERE name = '#{Analytics::Event::ReservedNames.PAGE_VIEW}'
    SQL
  end
end
