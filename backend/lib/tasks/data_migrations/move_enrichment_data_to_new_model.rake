require 'colorize'

namespace :data_migrations do
  desc "Moves the old `user_profile_enrichment_data` table to the new `enriched_data` table"
  task move_enrichment_data_to_new_model: [:environment] do
    puts "Purging ann `EnrichedData` records with bad data....".
    EnrichedData.where(enrichable_type: 'UserProfileEnrichmentData').delete_all

    puts "Starting migration...".colorize(:gray)
    ActiveRecord::Base.logger.silence do
      users_with_new_enrichment_data = []
      enrichment_data = UserProfileEnrichmentData.all
      puts "Attempting to migrate #{enrichment_data.count} enrichment data records...".colorize(:green)
      enrichment_data.each_with_index do |old_enrichment_data, i|
        user_already_enriched = EnrichedData.where(enrichable: old_enrichment_data.analytics_user_profile).exists?
        if user_already_enriched
          puts "Enrichment data already exists for #{old_enrichment_data.analytics_user_profile.email} (#{old_enrichment_data.workspace.name}). Skipping...".colorize(:yellow)
        else
          EnrichedData.create!(
            workspace: old_enrichment_data.workspace,
            enrichable: old_enrichment_data.analytics_user_profile,
            enrichment_service: 'people_data_labs',
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
          users_with_new_enrichment_data << old_enrichment_data.analytics_user_profile
          puts "Migrated enrichment data for #{old_enrichment_data.analytics_user_profile.email} (#{old_enrichment_data.workspace.name}).".colorize(:green)
        end
        puts "#{i + 1}/#{enrichment_data.count} complete.".colorize(:green)
      end
      puts "Migrated enrichment data for #{users_with_new_enrichment_data.uniq.count} users.".colorize(:green)
      if !users_with_new_enrichment_data.empty?
        puts "Enqueuing them to ClickHouse replication..."
        Ingestion::QueueManager.push_records_into_queue(
          Ingestion::QueueManager::Queues.CLICK_HOUSE_USER_PROFILES,
          users_with_new_enrichment_data.map(&:formatted_for_clickhouse_replication)
        ) 
      end
      puts "Completed migration!".colorize(:green)
    end
  end
end