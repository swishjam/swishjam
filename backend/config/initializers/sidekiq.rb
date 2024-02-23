require 'sidekiq/scheduler'

Rails.logger.info "Starting Sidekiq with Redis URL: #{ENV['REDIS_URL'] || 'redis://localhost:6379'}"
Rails.logger.info "Custom Ingestion Queue Redis URL: #{ENV['REDIS_INGESTION_QUEUE_URL']}"
Sidekiq.configure_server do |config|
  Sidekiq::Scheduler.reload_schedule!
end
