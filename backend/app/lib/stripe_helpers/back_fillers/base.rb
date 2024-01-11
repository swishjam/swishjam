module StripeHelpers
  module BackFillers
    class Base
      attr_accessor :workspace, :integration, :public_key, :stripe_account_id, :starting_from

      class << self
        attr_accessor :default_starting_from
      end

      def initialize(workspace, starting_from: nil)
        @workspace = workspace
        @starting_from = starting_from || self.class.default_starting_from
        @integration = Integrations::Stripe.for_workspace(workspace)
        raise "No Stripe integration found for workspace #{workspace.id}, cannot run backfill." if integration.nil?
        @public_key = workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.STRIPE)&.public_key
        raise "No Stripe API key found for workspace #{workspace.id}, cannot run backfill." if @public_key.nil?
        @stripe_account_id = integration.account_id
        @customer_cache = {}
      end

      def get_customer(customer_id)
        @customer_cache[customer_id] ||= ::Stripe::Customer.retrieve(customer_id, { stripe_account: @stripe_account_id })
      end
    end
  end
end