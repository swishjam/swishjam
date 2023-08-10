class StripeSynchronizerJob
  include Sidekiq::Job
  queue_as :default

  def perform
    Integrations::Stripe.enabled.each do |stripe_integration|
      sync = DataSync.create!(instance: stripe_integration.instance, provider: 'stripe', started_at: Time.current)
      begin
        DataSynchronizers::Stripe.new(stripe_integration.instance, stripe_integration.account_id).sync!
        sync.update!(completed_at: Time.current, duration_in_seconds: Time.current - sync.started_at)
      rescue => e
        sync.update!(error_message: e.message, completed_at: Time.current, duration_in_seconds: Time.current - sync.started_at)
      end
    end
  end
end