module DataSyncJobs
  class Stripe < Base
    self.integration_model_klass = Integrations::Stripe

    def run!(stripe_integration)
      DataSynchronizers::Stripe.new(workspace: stripe_integration.workspace, stripe_account_id: stripe_integration.account_id).sync!
    end
  end
end