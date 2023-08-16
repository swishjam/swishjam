class StripeSynchronizerJob
  include Sidekiq::Job
  queue_as :default

  def perform
    Swishjam::Integrations::Stripe.enabled.each do |stripe_integration|
      sync = Swishjam::DataSync.create!(organization: stripe_integration.organization, provider: 'stripe', started_at: Time.current)
      begin
        DataSynchronizers::Stripe.new(stripe_integration.organization, stripe_integration.account_id).sync!
        sync.update!(completed_at: Time.current, duration_in_seconds: Time.current - sync.started_at)
      rescue => e
        Rails.logger.error "Stripe sync failed for organization #{stripe_integration.organization.id} with error: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        sync.update!(error_message: e.message, completed_at: Time.current, duration_in_seconds: Time.current - sync.started_at)
      end
    end
  end
end