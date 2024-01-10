module StripeDataJobs
  class BackfillEventsForWorkspace
    include Sidekiq::Worker
    queue_as :default

    def perform(workspace_id)
      workspace = Workspace.find(workspace_id)
      StripeHelpers::EventBackfiller.new(workspace).backfill!
    end
  end
end