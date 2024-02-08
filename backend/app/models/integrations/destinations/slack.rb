module Integrations
  module Destinations
    class Slack < Integration
      def access_token
        config['access_token']
      end
    end
  end
end