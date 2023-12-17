module StripeHelpers
  class DataFetchers
    def self.get_all(starts_after: nil, ends_before: nil)
      raise ArgumentError, "Must provide a block to get_all" unless block_given?
      response = yield
      
      starts_after = starts_after.to_i if starts_after.present?
      ends_before = ends_before.to_i if ends_before.present?
      starts_after = Float::INFINITY * -1 if starts_after.nil?
      ends_before = Float::INFINITY if ends_before.nil?

      objects = []
      response.auto_paging_each do |object|
        break if starts_after && object.created < starts_after
        if object.created >= starts_after && object.created <= ends_before
          objects << object
        end
      end
      objects
    end

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
  end
end