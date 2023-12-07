class SyncCustomerSubscriptionFromStripeJob
  class FailedSyncError < StandardError; end

  include Sidekiq::Worker
  queue_as :default

  def perform(stripe_account_id:, stripe_subscription_id:)
    integration = Integrations::Stripe.includes(:workspace).where("integrations.config->>'stripe_account_id' = ?", stripe_account_id).limit(1).first
    raise FailedSyncError, "Unable to find `Integrations::Stripe` with Stripe Account ID #{stripe_account_id}, skipping `SyncCustomerSubscriptionFromStripeJob`" if !integration
    raise FailedSyncError, "Integration with Stripe Account ID #{stripe_account_id} is not enabled, skipping `SyncCustomerSubscriptionFromStripeJob`" if !integration.enabled?
    
    workspace = integration.workspace
    stripe_subscription = Stripe::Subscription.retrieve(
      { id: stripe_subscription_id, expand: ['customer', 'items.data.price.product'] }, 
      { stripe_account: stripe_account_id }
    )
    existing_customer_subscription = workspace.customer_subscriptions.find_by_provider_object_id(stripe_subscription.id)

    if existing_customer_subscription
      update_customer_subscription(existing_customer_subscription, stripe_subscription)
    else
      try_to_create_customer_subscription(workspace, stripe_subscription)
    end
  end

  private

  def try_to_create_customer_subscription(workspace, stripe_subscription)
    # eventually this should be more sophisicated, look up by other attributes, as well as find the organization as the parent profile
    parent_profile = workspace.analytics_user_profiles.find_by(email: stripe_subscription.customer.email)
    if parent_profile
      customer_subscription = workspace.customer_subscriptions.create!(
        parent_profile: parent_profile,
        subscription_provider_object_id: stripe_subscription.id,
        subscription_provider: 'stripe',
        status: stripe_subscription.status,
      )
      stripe_subscription.items.each do |item|
        CustomerSubscriptionItem.create!(
          customer_subscription: customer_subscription,
          subscription_provider_object_id: item.id,
          quantity: item.quantity,
          product_name: item.price.product.name,
          price_unit_amount: item.price.unit_amount,
          price_nickname: item.price.nickname,
          price_billing_scheme: item.price.billing_scheme,
          price_recurring_interval: item.price.recurring.interval,
          price_recurring_interval_count: item.price.recurring.interval_count,
          price_recurring_usage_type: item.price.recurring.usage_type,
        )
      end
    else
      # TODO: should we create a new user profile here?
      # we need to update the UserIngestion logic to account for this scenario if so
      Sentry.capture_message("Tried to create a `customer_subscription` but could not find a user with email #{stripe_subscription.customer.email} in workspace #{workspace.name} (#{workspace.id})")
    end
  end

  def update_customer_subscription(existing_customer_subscription, stripe_subscription)
    existing_customer_subscription.update!(status: stripe_subscription.status)
    subscription_items = stripe_subscription.items
    existing_customer_subscription.customer_subscription_items.each do |existing_customer_subscription_item|
      stripe_subscription_item = subscription_items.find{ |item| item.id == existing_customer_subscription_item.subscription_provider_object_id }
      if stripe_subscription_item
        subscription_items.delete(stripe_subscription_item)
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
        existing_customer_subscription_item.destroy!
      end
    end

    subscription_items.each do |subscription_item|
      existing_customer_subscription.customer_subscription_items.create!(
        subscription_provider_object_id: subscription_item.id,
        quantity: subscription_item.quantity,
        price_unit_amount: subscription_item.price.unit_amount,
        price_nickname: subscription_item.price.nickname,
        price_billing_scheme: subscription_item.price.billing_scheme,
        price_recurring_interval: subscription_item.price.recurring.interval,
        price_recurring_interval_count: subscription_item.price.recurring.interval_count,
        price_recurring_usage_type: subscription_item.price.recurring.usage_type,
      )
    end
  end
end