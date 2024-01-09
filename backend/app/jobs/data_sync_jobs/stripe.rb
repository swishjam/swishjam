module DataSyncJobs
  class Stripe < Base
    self.integration_model_klass = Integrations::Stripe

    def run!(stripe_integration, previous_data_sync)
      DataSynchronizers::Stripe.new(
        stripe_integration.workspace, 
        stripe_integration.account_id,
        start_timestamp: previous_data_sync&.completed_at || 1.year.ago,
        end_timestamp: Time.current
      ).sync!
    end
  end
end