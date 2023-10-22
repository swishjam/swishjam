require 'sidekiq/scheduler'

Sidekiq.configure_server do |config|
  Sidekiq::Scheduler.reload_schedule!
end
