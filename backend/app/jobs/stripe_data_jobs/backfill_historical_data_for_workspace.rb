module StripeDataJobs
  class BackfillHistoricalDataForWorkspace
    class InvalidBackfillError < StandardError; end
    include Sidekiq::Worker
    queue_as :default

    def perform(workspace_id)
      data_sync = DataSync.new(workspace_id: workspace_id, provider: 'stripe_backfill', started_at: Time.current)
      begin
        workspace = Workspace.find(workspace_id)
        integration = Integrations::Stripe.for_workspace(workspace)
        raise InvalidBackfillError, "Workspace #{workspace_id} does not have their Stripe account connected." if integration.nil?
        raise InvalidBackfillError, "Workspace #{workspace_id} Stripe Integration is disabled." if integration.disabled?
        StripeHelpers::BackFillers::Events.new(workspace).enqueue_historical_events_to_be_ingested!
        StripeHelpers::BackFillers::SupplementalChargeSucceeded.new(workspace, starting_from: 1.year.ago).enqueue_supplemental_charge_events_to_be_ingested!
        if workspace.settings.revenue_analytics_enabled
          StripeHelpers::BackFillers::BillingDataSnapshots.new(workspace, starting_from: 60.days.ago).backfill_snapshots!
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