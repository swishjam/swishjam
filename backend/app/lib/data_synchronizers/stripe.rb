module DataSynchronizers
  class Stripe
    def initialize(workspace:, stripe_account_id:)
      @workspace = workspace
      @stripe_account_id = stripe_account_id
      # @start_timestamp = start_timestamp
      # @end_timestamp = end_timestamp
      @stripe_snapshot_calculator = StripeHelpers::SnapshotCalculator.new(stripe_account_id)
    end

    def sync!
      create_billing_data_snapshot!
      create_revenue_retention_periods!
      # enqueue_mrr_movement_events_for_time_period!
    end

    private

    def create_billing_data_snapshot!
      Analytics::BillingDataSnapshot.create!(
        swishjam_api_key: @workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.STRIPE).public_key,
        mrr_in_cents: @stripe_snapshot_calculator.mrr,
        total_revenue_in_cents: @stripe_snapshot_calculator.total_revenue,
        num_active_subscriptions: @stripe_snapshot_calculator.total_num_active_subscriptions,
        num_paid_subscriptions: @stripe_snapshot_calculator.total_num_paid_subscriptions,
        num_free_trial_subscriptions: @stripe_snapshot_calculator.total_num_free_trial_subscriptions,
        num_canceled_subscriptions: @stripe_snapshot_calculator.total_num_canceled_subscriptions,
        num_customers_with_paid_subscriptions: @stripe_snapshot_calculator.total_num_customers_with_paid_subscriptions,
        captured_at: Time.current
      )
    end

    def create_revenue_retention_periods!
      return if !@workspace.settings.revenue_analytics_enabled
      StripeHelpers::RetentionCalculator.new(
        workspace_id: @workspace.id,
        stripe_account_id: @stripe_account_id,
      ).create_revenue_retention_periods_for_time_period!
    end

    # def enqueue_mrr_movement_events_for_time_period!
    #   StripeHelpers::MrrMovementHandler.new(
    #     workspace: @workspace,
    #     stripe_account_id: @stripe_account_id,
    #     public_key: @workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.STRIPE).public_key,
    #     start_date: @start_timestamp,
    #     end_date: @end_timestamp,
    #   ).enqueue_mrr_movement_events
    # end
  end
end