module Integrations
  class Stripe < Integration
    def account_id
      config['account_id']
    end
  end
end