class MakeClickhouseUserProfilesFullyReplicated < ActiveRecord::Migration[6.1]
  def up
    execute('DROP TABLE IF EXISTS swishjam_user_profiles')
    execute <<~SQL
      CREATE TABLE swishjam_user_profiles (
        `swishjam_api_key` LowCardinality(String),
        `workspace_id` String,
        `swishjam_user_id` String,
        `user_unique_identifier` Nullable(String),
        `email` Nullable(String),
        `first_name` Nullable(String),
        `last_name` Nullable(String),
        `full_name` Nullable(String),
        `gravatar_url` String,
        `lifetime_value_in_cents` Int64,
        `monthly_recurring_revenue_in_cents` Int64,
        `current_subscription_plan_name` Nullable(String),
        `created_by_data_source` LowCardinality(String),
        `initial_landing_page_url` Nullable(String),
        `initial_referrer_url` Nullable(String),
        `metadata` String,
        `enrichment_match_likelihood` Nullable(Int8),
        `enrichment_first_name` Nullable(String),
        `enrichment_last_name` Nullable(String),
        `enrichment_linkedin_url` Nullable(String),
        `enrichment_twitter_url` Nullable(String),
        `enrichment_github_url` Nullable(String),
        `enrichment_personal_email` Nullable(String),
        `enrichment_industry` Nullable(String),
        `enrichment_job_title` Nullable(String),
        `enrichment_company_name` Nullable(String),
        `enrichment_company_website` Nullable(String),
        `enrichment_company_size` Nullable(String),
        `enrichment_year_company_founded` Nullable(String),
        `enrichment_company_industry` Nullable(String),
        `enrichment_company_linkedin_url` Nullable(String),
        `enrichment_company_twitter_url` Nullable(String),
        `enrichment_company_location_metro` Nullable(String),
        `enrichment_company_location_geo_coordinates` Nullable(String),
        `created_at` DateTime,
        `updated_at` DateTime
      )
      ENGINE = ReplacingMergeTree(updated_at)
      PRIMARY KEY (workspace_id, swishjam_api_key)
      ORDER BY (workspace_id, swishjam_api_key, swishjam_user_id) 
    SQL
  end

  def down
    execute <<~SQL
      DROP TABLE swishjam_user_profiles
    SQL
  end
end
