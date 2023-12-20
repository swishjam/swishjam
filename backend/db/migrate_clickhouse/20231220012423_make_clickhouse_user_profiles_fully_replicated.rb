class MakeClickhouseUserProfilesFullyReplicated < ActiveRecord::Migration[6.1]
  def up
    execute('DROP TABLE IF EXISTS swishjam_user_profiles')
    execute <<~SQL
      CREATE TABLE swishjam_user_profiles (
        `swishjam_api_key` LowCardinality(String),
        `workspace_id` String,
        `swishjam_user_id` String,
        `user_unique_identifier` String,
        `email` String,
        `first_name` String,
        `last_name` String,
        `full_name` String,
        `gravatar_url` String,
        `lifetime_value_in_cents` Int64,
        `monthly_recurring_revenue_in_cents` Int64,
        `current_subscription_plan_name` String,
        `created_by_data_source` LowCardinality(String),
        `metadata` String,
        `enrichment_match_likelihood` Int8,
        `enrichment_first_name` String,
        `enrichment_last_name` String,
        `enrichment_linkedin_url` String,
        `enrichment_twitter_url` String,
        `enrichment_github_url` String,
        `enrichment_personal_email` String,
        `enrichment_industry` String,
        `enrichment_job_title` String,
        `enrichment_company_name` String,
        `enrichment_company_website` String,
        `enrichment_company_size` String,
        `enrichment_year_company_founded` String,
        `enrichment_company_industry` String,
        `enrichment_company_linkedin_url` String,
        `enrichment_company_twitter_url` String,
        `enrichment_company_location_metro` String,
        `enrichment_company_location_geo_coordinates` String,
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
