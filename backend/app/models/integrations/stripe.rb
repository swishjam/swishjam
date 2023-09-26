module Integrations
  class Stripe < Integration
    after_create :run_data_sync_job
    
    def account_id
      config['account_id']
    end
  end
end