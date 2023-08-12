module Swishjam
  module Integrations
    class Stripe < Swishjam::Integration
      def account_id
        config['account_id']
      end
    end
  end
end