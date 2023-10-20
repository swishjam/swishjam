module DummyData
  class BillingData
    class << self
      def generate!(workspace)
        progress_bar = TTY::ProgressBar.new("Generating billing data for the last 365 days [:bar]", total: 375, bar_format: :block)
  
        previous_mrr = 1_000_000 * 100
        previous_total_revenue = 5_000_000 * 100
        previous_num_active_subscriptions = 1_000
        previous_num_free_trial_subscriptions = 250
        previous_num_canceled_subscriptions = 1_000

        last_snapshot = nil
        current_date = 10.days.from_now.beginning_of_day
        while current_date >= 365.days.ago.beginning_of_day do
          last_snapshot = Analytics::BillingDataSnapshot.create!(
            swishjam_api_key: workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.STRIPE).public_key,
            mrr_in_cents: (last_snapshot&.mrr_in_cents || 1_000_000 * 100) * rand(0.8..1.05),
            total_revenue_in_cents: (last_snapshot&.total_revenue_in_cents || 5_000_000 * 100) * rand(0.8..1.05),
            num_active_subscriptions: (last_snapshot&.num_active_subscriptions || 1_000) * rand(0.8..1.05),
            num_free_trial_subscriptions: (last_snapshot&.num_free_trial_subscriptions || 250) * rand(0.8..1.05),
            num_canceled_subscriptions: (last_snapshot&.num_canceled_subscriptions || 1_000) * rand(0.8..1.05),
            captured_at: current_date,
          )
          current_date -= 1.day
          progress_bar.advance
        end
        puts "\n"
      end
    end
  end
end