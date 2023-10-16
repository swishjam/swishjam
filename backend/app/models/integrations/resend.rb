module Integrations
  class Resend < Integration
    self.data_source = ApiKey::ReservedDataSources.RESEND

    def webhook_signing_secret
      config['webhook_signing_secret']
    end
  end
end