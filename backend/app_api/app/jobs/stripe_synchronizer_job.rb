class StripeSynchronizerJob
  include Sidekiq::Job
  queue_as :default

  def perform
    Integrations::Stripe.enabled.each do |stripe_integration|
      DataSynchronizers::Stripe.new(stripe_integration.instance, stripe_integration.account_id).sync!
    end
  end
end