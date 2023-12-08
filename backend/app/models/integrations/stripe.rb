module Integrations
  class Stripe < Integration
    self.data_source = ApiKey::ReservedDataSources.STRIPE
    after_create :run_data_sync_job

    validate :config_has_account_id
    
    def account_id
      config['account_id']
    end
    
    def run_data_sync_job
      DataSyncJobs::Stripe.perform_async(self.id)
    end

    private

    def after_destroy_callback
      ::Stripe::OAuth.deauthorize(client_id: ENV['STRIPE_CLIENT_ID'], stripe_user_id: account_id)
    rescue => e
      Sentry.capture_exception(e)
      Rails.logger.error "Unable to deauthorize Stripe OAuth from Account ID #{account_id}: #{e.inspect}"
    end

    def config_has_account_id
      errors.add(:config, "must have an `account_id` key") if !config['account_id'].present?
    end
  end
end