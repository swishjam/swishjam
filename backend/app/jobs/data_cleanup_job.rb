class DataCleanupJob
  include Sidekiq::Worker
  queue_as :default

  def perform
    IngestionBatch.older_than(7.days.ago, column: :completed_at).delete_all
  end
end