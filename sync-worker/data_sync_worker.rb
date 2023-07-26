require 'sidekiq'
require 'dotenv/load'
require_relative 'lib/util/data_source_config_fetcher'
require_relative 'lib/etl'

Sidekiq.configure_client do |config|
  config.redis = { db: 1 }
end

Sidekiq.configure_server do |config|
  config.redis = { db: 1 }
end

# SOURCE_TYPES_TO_SYNC = ['stripe_charges', 'stripe_payment_intents', 'stripe_customers', 'posthog_customers']
SOURCE_TYPES_TO_SYNC = ['stripe_charges']

class DataSyncWorker
  include Sidekiq::Worker
  sidekiq_options queue: :data_sync, retry: 3

  def perform(interval)
    start = Time.now
    puts "Beginning data synchronization for #{interval} interval."
    
    SOURCE_TYPES_TO_SYNC.each do |data_source_type|
      source_sync_start = Time.now
      sources_to_sync = DataSourceConfigFetcher.fetch_all_configs_for(interval: interval, source_type: data_source_type)
      puts "Beginning to run #{sources_to_sync.count} ETLs for #{data_source_type} sources..."
      sources_to_sync.each{ |data_source_config| ETL.run!(data_source_config) }
      puts "Completed #{data_source_type} ETL for #{sources_to_sync.count} organizations in #{Time.now - source_sync_start} seconds." 
    end

    puts "Data synchronization complete. Took #{Time.now - start} seconds."
  end
end