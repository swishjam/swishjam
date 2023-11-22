module Integrations
  class GoogleSearchConsole < Integration
    self.data_source = ApiKey::ReservedDataSources.GOOGLE_SEARCH_CONSOLE

    def access_token
      config['access_token']
    end

    def refresh_token
      config['refresh_token']
    end

    def expires_at
      DateTime.parse(config['expires_at'])
    end

    def expired?
      expires_at < Time.current
    end

    def self.friendly_name
      'Google Search Console'
    end
  end
end