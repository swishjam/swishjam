class ChangeEnrichmentDataToJsonColumn < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      ALTER TABLE swishjam_user_profiles
      ADD COLUMN enrichment_data JSONB DEFAULT '{}'
    SQL
    execute <<~SQL
      ALTER TABLE swishjam_organization_profiles
      ADD COLUMN enrichment_data JSONB DEFAULT '{}'
    SQL

    built_json_concat = "{" 
    enrichment_columns = %w[
      enrichment_first_name
      enrichment_last_name
      enrichment_linkedin_url
      enrichment_twitter_url
      enrichment_github_url
      enrichment_personal_email
      enrichment_industry
      enrichment_job_title
      enrichment_company_name
      enrichment_company_website
      enrichment_company_size
      enrichment_year_company_founded
      enrichment_company_industry
      enrichment_company_linkedin_url
      enrichment_company_twitter_url
      enrichment_company_location_metro
      enrichment_company_location_geo_coordinates
    ]
    enrichment_columns.each_with_index do |column, i|
      built_json_concat << "\"#{column.gsub('enrichment_', '')}\": "
      built_json_concat << "\"', ifNull(#{column}, ''), '\""
      built_json_concat << ", " if i < enrichment_columns.count - 1
    end
    built_json_concat << "}"

    execute <<~SQL
      ALTER TABLE swishjam_user_profiles
      UPDATE enrichment_data = CONCAT('#{built_json_concat}')
      WHERE 1
    SQL
  end

  def down
    execute <<~SQL
      ALTER TABLE swishjam_user_profiles
      DROP COLUMN enrichment_data
    SQL
    execute <<~SQL
      ALTER TABLE swishjam_organization_profiles
      DROP COLUMN enrichment_data
    SQL
  end
end
