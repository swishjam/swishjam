class UserProfileSerializer < ActiveModel::Serializer
  attributes :id, :user_unique_identifier, :email, :lifetime_value_in_cents, :initials, :full_name, :first_name, :last_name, :metadata, 
              :created_at, :organizations, :enrichment_data, :active_subscriptions, :current_mrr_in_cents, :gravatar_url, :created_by_data_source, :is_anonymous

  def organizations
    object.analytics_organization_profiles
  end

  def enrichment_data
    object.enrichment_data || {}
  end

  def active_subscriptions
    object.customer_subscriptions.includes(:customer_subscription_items).active.map do |subscription|
      {
        id: subscription.id,
        subscription_provider_object_id: subscription.subscription_provider_object_id,
        subscription_provider: subscription.subscription_provider,
        status: subscription.status,
        subscription_items: subscription.customer_subscription_items.map do |item|
          {
            id: item.id,
            product_name: item.product_name,
            quantity: item.quantity,
            price_unit_amount: item.price_unit_amount,
            price_nickname: item.price_nickname,
            price_billing_scheme: item.price_billing_scheme,
            price_recurring_interval: item.price_recurring_interval,
            price_recurring_interval_count: item.price_recurring_interval_count,
            price_recurring_usage_type: item.price_recurring_usage_type
          }
        end
      }
    end
  end

  def current_mrr_in_cents
    object.customer_subscriptions.active.sum do |subscription| 
      StripeHelpers::MrrCalculator.calculate_for_swishjam_subscription_record(subscription)
    end
  end

  def metadata
    # short term bandaid for inadvertently capturing unintentional metadata
    (object.metadata || {}).except('userIdentifier', 'url', 'device_identifier', 'session_identifier', 'page_view_identifier')
  rescue => e
    Sentry.capture_exception(e)
    Rails.logger.error "Unable to serializer #{object.email} (#{object.id}) user's metadata for workspace #{object.workspace.name} (#{object.workspace.name}): #{e.inspect}"
    {}
  end
end