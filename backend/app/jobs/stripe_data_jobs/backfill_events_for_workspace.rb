module StripeDataJobs
  class BackfillEventsForWorkspace
    include Sidekiq::Worker
    queue_as :default

    def perform(workspace_id)
      workspace = Workspace.find(workspace_id)
      StripeHelpers::BackFillers::Events.new(workspace).enqueue_historical_events_to_be_ingested!
      StripeHelpers::BackFillers::BillingDataSnapshots.new(workspace, starting_from: 60.days.ago).backfill_snapshots!
    end
  end
end