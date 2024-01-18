module StripeDataJobs
  class BackfillHistoricalDataForWorkspace
    class InvalidBackfillError < StandardError; end
    include Sidekiq::Worker
    queue_as :default

    BACKFILLERS = [
      StripeHelpers::BackFillers::SupplementalChargeSucceeded, 
      StripeHelpers::BackFillers::SupplementalFreeTrialStarted, 
      StripeHelpers::BackFillers::SupplementalNewSubscriber,
      StripeHelpers::BackFillers::SupplementalSubscriptionChurned,
      StripeHelpers::BackFillers::SupplementalNewActiveSubscription,
    ]

    def perform(workspace_id)
      data_sync = DataSync.create!(workspace_id: workspace_id, provider: 'stripe_backfill', started_at: Time.current)
      begin
        workspace = Workspace.find(workspace_id)
        integration = Integrations::Stripe.for_workspace(workspace)
        raise InvalidBackfillError, "Workspace #{workspace_id} does not have their Stripe account connected." if integration.nil?
        raise InvalidBackfillError, "Workspace #{workspace_id} Stripe Integration is disabled." if integration.disabled?
        data_fetcher = StripeHelpers::BackFillers::DataFetcher.new(integration.account_id)
        BACKFILLERS.each do |backfiller| 
          backfiller.new(workspace, data_fetcher: data_fetcher).enqueue_for_ingestion!
        rescue => e
          byebug
          Sentry.capture_message("Stripe backfiller #{backfiller.to_s} failed for workspace #{workspace.name} (#{workspace.id}), error: #{e.message}")
        end
        if workspace.settings.revenue_analytics_enabled
          StripeHelpers::BackFillers::BillingDataSnapshots.new(workspace, data_fetcher: data_fetcher).backfill_snapshots!
        end
      rescue => e
        data_sync.error_message = e.message
        Sentry.capture_exception(e)
      end
      data_sync.duration_in_seconds = Time.current - data_sync.started_at
      data_sync.completed_at = Time.current
      data_sync.save!
    end
  end
end