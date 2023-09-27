module StripeHelpers
  class DataFetchers
    def self.get_all_subscriptions(stripe_account_id, expand: ['data.customer', 'data.plan.product'], subscriptions: [], starting_after: nil)
      response = ::Stripe::Subscription.list({ starting_after: starting_after, expand: expand }, stripe_account: stripe_account_id)
      subscriptions += response.data
      return subscriptions unless response.has_more
      get_all_subscriptions(stripe_account_id, expand: expand, subscriptions: subscriptions, starting_after: response.data.last.id)
    end

    def self.get_all_charges(stripe_account_id, expand: ['data.customer'], charges: [], starting_after: nil)
      response = ::Stripe::Charge.list({ starting_after: starting_after, expand: expand }, stripe_account: stripe_account_id)
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

    def self.get_all_customers(stripe_account_id, expand: [], customers: [], starting_after: nil)
      response = ::Stripe::Customer.list({ starting_after: starting_after, expand: expand }, stripe_account: stripe_account_id)
      customers += response.data
      return customers unless response.has_more
      get_all_customers(stripe_account_id, expand: expand, customers: customers, starting_after: response.data.last.id)
    end

    def self.get_all_events(stripe_account_id, event_types, events: [], limit: 100, created_after:, starting_after: nil)
      response = ::Stripe::Event.list({ types: event_types, created: { gt: created_after.to_i }, starting_after: starting_after, limit: limit }, stripe_account: stripe_account_id)
      events += response.data
      return events unless response.has_more
      get_all_events(stripe_account_id, event_types, events: events, limit: limit, created_after: created_after, starting_after: response.data.last.id)
    end
  end
end