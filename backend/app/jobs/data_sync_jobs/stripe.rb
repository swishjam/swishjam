module DataSyncJobs
  class Stripe < Base
    self.integration_model_klass = Integrations::Stripe

    def run!(stripe_integration, start_date:, end_date: Time.current)
      DataSynchronizers::Stripe.new(stripe_integration.workspace, stripe_integration.account_id, start_date: start_date, end_date: end_date).sync!
    end
  end
end