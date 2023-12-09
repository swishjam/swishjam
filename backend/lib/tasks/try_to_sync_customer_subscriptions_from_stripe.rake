require 'colorize'

def update_existing_customer_subscription(existing_customer_subscription, stripe_subscription)
  existing_customer_subscription.update!(status: stripe_subscription.status)

  pre_existing_customer_subscription_items_to_delete = existing_customer_subscription.customer_subscription_items.to_a
  stripe_subscription.items.each do |stripe_subscription_item|
    pre_existing_customer_subscription_items_to_delete.delete_if { |item| item.subscription_provider_object_id == stripe_subscription_item.id }

    stripe_product = Stripe::Product.retrieve(stripe_subscription_item.price.product, { stripe_account: stripe_subscription.account })
    existing_customer_subscription_item = existing_customer_subscription.customer_subscription_items.find_by(subscription_provider_object_id: stripe_subscription_item.id)
    if existing_customer_subscription_item
      existing_customer_subscription_item.update!(
        quantity: stripe_subscription_item.quantity,
        product_name: stripe_subscription_item.price.product.name,
        price_unit_amount: stripe_subscription_item.price.unit_amount,
        price_nickname: stripe_subscription_item.price.nickname,
        price_billing_scheme: stripe_subscription_item.price.billing_scheme,
        price_recurring_interval: stripe_subscription_item.price.recurring.interval,
        price_recurring_interval_count: stripe_subscription_item.price.recurring.interval_count,
        price_recurring_usage_type: stripe_subscription_item.price.recurring.usage_type,
      )
    else
      CustomerSubscriptionItem.create!(
        customer_subscription: existing_customer_subscription,
        subscription_provider_object_id: stripe_subscription_item.id,
        quantity: stripe_subscription_item.quantity,
        product_name: stripe_product.name,
        price_unit_amount: stripe_subscription_item.price.unit_amount,
        price_nickname: stripe_subscription_item.price.nickname,
        price_billing_scheme: stripe_subscription_item.price.billing_scheme,
        price_recurring_interval: stripe_subscription_item.price.recurring.interval,
        price_recurring_interval_count: stripe_subscription_item.price.recurring.interval_count,
        price_recurring_usage_type: stripe_subscription_item.price.recurring.usage_type,
      )
    end
  end
  pre_existing_customer_subscription_items_to_delete.destroy_all
end

def create_new_customer_subscription(user_profile:, stripe_subscription:, stripe_account_id:)
  customer_subscription = CustomerSubscription.create!(
    workspace: user_profile.workspace,
    parent_profile: user_profile,
    subscription_provider_object_id: stripe_subscription.id,
    subscription_provider: 'stripe',
    status: stripe_subscription.status,
  )
  stripe_subscription.items.each do |stripe_subscription_item|
    stripe_product = Stripe::Product.retrieve(stripe_subscription_item.price.product, { stripe_account: stripe_account_id })
    CustomerSubscriptionItem.create!(
      customer_subscription: customer_subscription,
      subscription_provider_object_id: stripe_subscription_item.id,
      quantity: stripe_subscription_item.quantity,
      product_name: stripe_product.name,
      price_unit_amount: stripe_subscription_item.price.unit_amount,
      price_nickname: stripe_subscription_item.price.nickname,
      price_billing_scheme: stripe_subscription_item.price.billing_scheme,
      price_recurring_interval: stripe_subscription_item.price.recurring.interval,
      price_recurring_interval_count: stripe_subscription_item.price.recurring.interval_count,
      price_recurring_usage_type: stripe_subscription_item.price.recurring.usage_type,
    )
  end
end

namespace :data do
  task try_to_sync_customer_subscriptions_from_stripe: [:environment] do
    ActiveRecord::Base.logger.silence do
      import_results = {}
      Integrations::Stripe.includes(:workspace).enabled.each do |integration|
        workspace = integration.workspace
        import_results["#{workspace.name} (#{workspace.id})"] = { 'successful_imports' => 0, 'failed_imports' => 0 }
        puts "Attempting to import customer subscriptions from Stripe for workspace #{workspace.name} (#{workspace.id})...".colorize(:grey)
        StripeHelpers::DataFetchers.get_all_subscriptions(integration.account_id, expand: ['data.customer', 'data.items.data.price']).each do |stripe_subscription|
          user_profile = stripe_subscription.customer.email.blank? ? nil : workspace.analytics_user_profiles.find_by(email: stripe_subscription.customer.email)
          if user_profile
            existing_customer_subscription = user_profile.customer_subscriptions.find_by(subscription_provider_object_id: stripe_subscription.id)
            if existing_customer_subscription
              update_existing_customer_subscription(existing_customer_subscription, stripe_subscription)
            else
              create_new_customer_subscription(user_profile: user_profile, stripe_subscription: stripe_subscription, stripe_account_id: integration.account_id)
            end
            puts "Successfully imported subscription for customer #{user_profile.email} in workspace #{workspace.name} (#{workspace.id})".colorize(:green)
            import_results["#{workspace.name} (#{workspace.id})"]["successful_imports"] += 1
          else
            if stripe_subscription.customer.email.blank?
              puts "The customer associated with the Stripe Subscription (#{stripe_subscription.id}) does not have an email, cannot perform a user match, workspace #{workspace.name} (#{workspace.id})".colorize(:red)
            else
              puts "Could not find a matching user profile for stripe customer with email #{stripe_subscription.customer.email} in workspace #{workspace.name} (#{workspace.id})".colorize(:red)
            end
            import_results["#{workspace.name} (#{workspace.id})"]["failed_imports"] += 1
          end
        end
        puts "\n\n"
      end
      puts "Import results:".colorize(:yellow)
      import_results.each do |workspace_name, import_result|
        puts "#{workspace_name} - successful imports: #{import_result['successful_imports']} failed imports: #{import_result['failed_imports']}".colorize(:yellow)
      end
    end
  end
end