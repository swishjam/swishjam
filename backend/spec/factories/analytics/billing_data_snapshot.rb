FactoryBot.define do
  factory :analytics_billing_data_snapshot, class: Analytics::BillingDataSnapshot do
    swishjam_api_key { 'my_api_key' }
    mrr_in_cents { 1_000 * 100 }
    total_revenue_in_cents { 1_000_000 * 100 }
    num_active_subscriptions { 100 }
    num_free_trial_subscriptions { 100 }
    num_canceled_subscriptions { 100 }
    num_paid_subscriptions { 100 }
    num_customers_with_paid_subscriptions { 100 }
    captured_at { Time.current }
  end
end