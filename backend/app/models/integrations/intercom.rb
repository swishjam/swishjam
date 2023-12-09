module Integrations
  class Intercom < Integration
    self.data_source = ApiKey::ReservedDataSources.INTERCOM

    validate :config_must_have_access_token

    def access_token
      config['access_token']
    end

    private

    def config_must_have_access_token
      errors.add(:config, "must contain an `access_token`.") if config['access_token'].blank?
    end
  end
end