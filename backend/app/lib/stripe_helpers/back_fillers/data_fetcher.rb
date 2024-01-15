module StripeHelpers
  module BackFillers
    class DataFetcher
      attr_accessor :stripe_account_id

      def initialize(stripe_account_id)
        @stripe_account_id = stripe_account_id
        @customer_cache = {}
      end

      def flush_cache!
        instance_variables.each do |var|
          next if var == :@stripe_account_id
          instance_variable_set(var, nil)
        end
      end

      def subscriptions_for_all_of_time(status: 'all')
        return instance_variable_get(:"@#{status}_subscriptions_for_all_of_time") if instance_variable_get(:"@#{status}_subscriptions_for_all_of_time").present?
        instance_variable_set(:"@#{status}_subscriptions_for_all_of_time", get_all(Stripe::Subscription, status: status))
      end

      def subscriptions_for_past_year(status: 'all')
        return instance_variable_get(:"@#{status}_subscriptions_for_past_year") if instance_variable_get(:"@#{status}_subscriptions_for_past_year").present?
        instance_variable_set(:"@#{status}_subscriptions_for_past_year", get_all(Stripe::Subscription, status: status, created: { gte: 1.year.ago.to_i }))
      end

      def charges_for_all_of_time
        @charges_for_all_of_time ||= get_all(Stripe::Charge)
      end

      def charges_for_past_year
        @charges_for_past_year ||= get_all(Stripe::Charge, created: { gte: 1.year.ago.to_i })
      end

      def customers_for_past_year
        @customers_for_past_year ||= get_all(Stripe::Customer, created: { gte: 1.year.ago.to_i }, expand: [])
      end

      def get_customer(customer_id)
        @customer_cache[customer_id] ||= Stripe::Customer.retrieve(customer_id, { stripe_account: stripe_account_id })
      end

      private

      def get_all(stripe_object, opts = {})
        StripeHelpers::DataFetchers.get_all do
          stripe_object.list({ limit: 100, expand: ['data.customer'] }.merge(opts), { stripe_account: stripe_account_id })
        end
      end
    end
  end
end