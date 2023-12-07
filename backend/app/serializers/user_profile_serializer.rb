class UserProfileSerializer < ActiveModel::Serializer
  attributes :id, :user_unique_identifier, :email, :initials, :full_name, :first_name, :last_name, :metadata, :immutable_metadata, :created_at, 
              :organizations, :enrichment_data, :active_subscriptions, :current_mrr_in_cents, :gravatar_url

  def organizations
    object.analytics_organization_profiles
  end

  def enrichment_data
    object.enrichment_data || {}
  end

  def active_subscriptions
    object.customer_subscriptions.active.map do |subscription|
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
      subscription.customer_subscription_items.sum do |item| 
        case item.price_recurring_interval
        when 'day'
          item.price_unit_amount.to_f * item.quantity.to_f * (30 / item.price_recurring_interval_count.to_f)
        when 'week'
          # 52 weeks per year / 12 months = 4.345 weeks per month
          item.price_unit_amount.to_f * item.quantity.to_f * (4.345 / item.price_recurring_interval_count.to_f)
        when 'month'
          item.price_unit_amount.to_f * item.quantity.to_f / item.price_recurring_interval_count.to_f
        when 'year'
          item.price_unit_amount.to_f * item.quantity.to_f / (12 * item.price_recurring_interval_count.to_f)
        end
      end
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