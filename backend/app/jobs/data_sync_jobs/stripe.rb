module DataSyncJobs
  class Stripe < Base
    self.integration_model_klass = Integrations::Stripe

    def run!(stripe_integration)
      DataSynchronizers::Stripe.new(stripe_integration.workspace, stripe_integration.account_id).sync!
    end
  end
end