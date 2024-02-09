module StripeHelpers
  module BackFillers
    class Base
      attr_accessor :workspace, :integration, :public_key, :stripe_account_id, :starting_from, :data_fetcher

      class << self
        attr_accessor :default_starting_from
      end

      def initialize(workspace, data_fetcher:, allow_nil_data_fetcher: false)
        @workspace = workspace
        @integration = Integrations::Stripe.for_workspace(workspace)
        raise "No Stripe integration found for workspace #{workspace.id}, cannot run backfill." if integration.nil?
        @public_key = workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.STRIPE)&.public_key
        raise "No Stripe API key found for workspace #{workspace.id}, cannot run backfill." if @public_key.nil?
        @stripe_account_id = integration.account_id
        @data_fetcher = data_fetcher
        raise "No data fetcher provided for backfiller #{self.class.name}" if @data_fetcher == nil && !allow_nil_data_fetcher
        @data_fetcher = DataFetcher.new(@stripe_account_id) if @data_fetcher.nil?
      end
    end
  end
end