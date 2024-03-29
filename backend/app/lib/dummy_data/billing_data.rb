module DummyData
  class BillingData
    class << self
      def generate!(workspace)
        progress_bar = TTY::ProgressBar.new("Generating billing data for the last 365 days [:bar]", total: 375, bar_format: :block)

        stripe_public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.STRIPE).public_key
  
        previous_mrr = 1_000_000 * 100
        previous_total_revenue = 5_000_000 * 100
        previous_num_active_subscriptions = 1_000
        previous_num_free_trial_subscriptions = 250
        previous_num_canceled_subscriptions = 1_000

        snapshots = []
        last_snapshot = nil
        current_date = 10.days.from_now.beginning_of_day
        
        while current_date >= 365.days.ago.beginning_of_day do
          num_active_subscriptions = (previous_num_active_subscriptions * rand(0.8..1.05)).to_i
          num_paid_subscriptions = (num_active_subscriptions * rand(0.8..1)).to_i
          last_snapshot = {
            swishjam_api_key: stripe_public_key,
            mrr_in_cents: ((last_snapshot || {})[:mrr_in_cents] || 1_000_000 * 100) * rand(0.8..1.05),
            total_revenue_in_cents: ((last_snapshot || {})[:total_revenue_in_cents] || 5_000_000 * 100) * rand(0.8..1.05),
            num_active_subscriptions: num_active_subscriptions,
            num_free_trial_subscriptions: ((last_snapshot || {})[:num_free_trial_subscriptions] || 250) * rand(0.8..1.05).to_i,
            num_canceled_subscriptions: ((last_snapshot || {})[:num_canceled_subscriptions] || 1_000) * rand(0.8..1.05).to_i,
            num_paid_subscriptions: num_paid_subscriptions,
            num_customers_with_paid_subscriptions: num_paid_subscriptions * rand(0.9..1).to_i,
            captured_at: current_date,
          }
          snapshots << last_snapshot

          current_date -= 1.day
          progress_bar.advance
        end
        Analytics::BillingDataSnapshot.insert_all!(snapshots)
        puts "\n"
      end

      private

      def new_mrr_movement_event(movement_type, date, public_key, is_negative: false)
        Analytics::Event.formatted_for_preparation(
          uuid: SecureRandom.uuid,
          swishjam_api_key: public_key,
          name: Analytics::Event::ReservedNames.MRR_MOVEMENT,
          occurred_at: date,
          properties: {
            movement_type: movement_type,
            movement_amount: rand(10 * 100..1_000 * 100) * (is_negative ? -1 : 1),
            stripe_subscription_id: SecureRandom.uuid,
            stripe_customer_id: SecureRandom.uuid,
            stripe_customer_email: Faker::Internet.email,
          }
        )
      end
    end
  end
end