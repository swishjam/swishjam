# FactoryBot.define do
#   factory :analytics_customer_subscription, class: Analytics::CustomerSubscription do
#     association :swishjam_organization, factory: :swishjam_organization
#     association :owner, factory: :analytics_organization
#     payment_processor { 'stripe' }
#     provider_id { 'fake_stripe_subscription_id' }
#     customer_email { 'johnny@appleseed.com' }
#     customer_name { 'Johnny Appleseed' }
#     status { 'active' }
#     started_at { Time.current }
#     next_charge_runs_at { Time.current + 1.month }
#     ends_at { nil }
#     free_trial_starts_at { nil }
#     free_trial_ends_at { nil }
    
#     transient do
#       subscription_items_attributes { [{ quantity: 1, unit_amount_in_cents: 100_00, interval: 'month', plan_name: 'Gold Plan' }] }
#     end

#     after(:build) do |customer_subscription, evaluator|
#       evaluator.subscription_items_attributes.each do |subscription_item_attributes|
#         customer_subscription.subscription_items.build(subscription_item_attributes)
#       end
#     end
#   end
# end