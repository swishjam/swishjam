class DestroyRecordJob
  include Sidekiq::Worker
  queue_as :default

  def perform(klass, id)
    record = klass.constantize.find(id)
    record.destroy(_is_in_background: true)
  rescue ActiveRecord::RecordNotFound
    Sentry.capture_message("Record not found for #{klass} with id #{id} in DestroyRecordJob, it was likely already deleted and the user tried to delete it again.")
  end
end