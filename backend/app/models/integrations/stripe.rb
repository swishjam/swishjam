module Integrations
  class Stripe < Integration
    after_create :run_data_sync_job
    
    def account_id
      config['account_id']
    end

    def run_data_sync_job
      DataSyncJobs::Stripe.perform_async(integration: self)
    end
  end
end