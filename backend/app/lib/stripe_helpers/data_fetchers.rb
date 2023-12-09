module StripeHelpers
  class DataFetchers
    def self.get_all_subscriptions(stripe_account_id, expand: ['data.customer', 'data.plan.product'], subscriptions: [], starting_after: nil)
      response = ::Stripe::Subscription.list({ starting_after: starting_after, expand: expand }, stripe_account: stripe_account_id)
      subscriptions += response.data
      return subscriptions unless response.has_more
      get_all_subscriptions(stripe_account_id, expand: expand, subscriptions: subscriptions, starting_after: response.data.last.id)
    end

    def self.get_all_charges(stripe_account_id, expand: ['data.customer'], charges: [], starting_after: nil, customer: nil)
      response = ::Stripe::Charge.list({ customer: customer, starting_after: starting_after, expand: expand }, stripe_account: stripe_account_id)
      charges += response.data
      return charges unless response.has_more
      get_all_charges(stripe_account_id, charges: charges, starting_after: response.data.last.id)
    end

    def self.get_all_invoices_for_subscription(stripe_account_id, stripe_subscription_id, expand: [], invoices: [], starting_after: nil)
      response = ::Stripe::Invoice.list({ subscription: stripe_subscription_id, starting_after: starting_after, expand: expand, }, stripe_account: stripe_account_id)
      invoices += response.data
      return invoices unless response.has_more
      get_all_invoices_for_subscription(stripe_account_id, stripe_subscription_id, expand: expand, invoices: invoices, starting_after: response.data.last.id)
    end

    def self.get_all_customers(stripe_account_id, customers: [], starting_after: nil)
      response = ::Stripe::Customer.list({ starting_after: starting_after }, stripe_account: stripe_account_id)
      customers += response.data
      return customers unless response.has_more
      get_all_customers(stripe_account_id, customers: customers, starting_after: response.data.last.id)
    end
  end
end