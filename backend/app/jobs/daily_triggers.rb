class DailyTriggers
  include Sidekiq::Job
  queue_as :default

  def perform
    Rails.logger.info 'Please and thank you'
  end
end