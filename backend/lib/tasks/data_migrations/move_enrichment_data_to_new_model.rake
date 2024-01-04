require 'colorize'

namespace :data_migrations do
  desc "Moves the old `user_profile_enrichment_data` table to the new `enriched_data` table"
  task move_enrichment_data_to_new_model: [:environment] do
    puts "Starting migration...".colorize(:gray)
    ActiveRecord::Base.logger.silence do
      enrichment_data = UserProfileEnrichmentData.all
      enrichment_data.each_with_index do |old_enrichment_data, i|
        EnrichedData.create!(
          workspace: old_enrichment_data.workspace,
          enrichable: old_enrichment_data,
          data: {
            match_likelihood: old_enrichment_data.match_likelihood,
            first_name: old_enrichment_data.first_name,
            last_name: old_enrichment_data.last_name,
            linkedin_url: old_enrichment_data.linkedin_url,
            twitter_url: old_enrichment_data.twitter_url,
            github_url: old_enrichment_data.github_url,
            work_email: old_enrichment_data.work_email,
            personal_email: old_enrichment_data.personal_email,
            industry: old_enrichment_data.industry,
            job_title: old_enrichment_data.job_title,
            company_name: old_enrichment_data.company_name,
            company_website: old_enrichment_data.company_website,
            company_size: old_enrichment_data.company_size,
            year_company_founded: old_enrichment_data.year_company_founded,
            company_industry: old_enrichment_data.company_industry,
            company_linkedin_url: old_enrichment_data.company_linkedin_url,
            company_twitter_url: old_enrichment_data.company_twitter_url,
            company_location_metro: old_enrichment_data.company_location_metro,
            company_location_geo_coordinates: old_enrichment_data.company_location_geo_coordinates,
          }
        )
        puts "#{i + 1}/#{enrichment_data.count} complete.".colorize(:green)
      end
    end
    puts "Completed migration!".colorize(:green)
  end
end