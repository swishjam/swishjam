class AddEnrichmentDataToUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :user_profile_enrichment_attempts do |t|
      t.references :workspace, type: :uuid
      t.references :analytics_user_profile, type: :uuid, index: { name: :idx_enrichment_attempt_on_user_profile_id }
      t.references :user_profile_enrichment_data, type: :uuid, index: { name: :idx_enrichment_attempt_on_user_enrichment_data_id }
      t.boolean :successful
      t.string :attempted_payload
      t.timestamp :attempted_at
    end

    create_table :user_profile_enrichment_data, id: :uuid do |t|
      t.references :workspace, type: :uuid
      t.references :analytics_user_profile, type: :uuid
      t.integer :match_likelihood
      t.string :first_name
      t.string :last_name
      t.string :linkedin_url
      t.string :twitter_url
      t.string :github_url
      t.string :work_email
      t.string :personal_email
      t.string :industry
      t.string :job_title
      t.string :company_name
      t.string :company_website
      t.string :company_size
      t.string :year_company_founded
      t.string :company_industry
      t.string :company_linkedin_url
      t.string :company_twitter_url
      t.string :company_location_metro
      t.string :company_location_geo_coordinates
      t.timestamps
    end

    add_column :workspaces, :should_enrich_user_profile_data, :boolean
  end
end
