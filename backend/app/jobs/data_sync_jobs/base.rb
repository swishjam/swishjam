module DataSyncJobs
  class Base
    include Sidekiq::Job
    queue_as :default

    class << self
      attr_accessor :integration_model_klass
    end

    def perform(integration_id = nil)
      raise "Cannot run on base class" if self.class == DataSyncJobs::Base
      if integration_id
        integration = self.class.integration_model_klass.find(integration_id)
        run_sync_for_integration(integration)
      else
        self.class.integration_model_klass.enabled.each do |integration|
          run_sync_for_integration(integration)
        end
      end
    end

    private

    def run_sync_for_integration(integration)
      sync = DataSync.create!(
        workspace: integration.workspace, 
        provider: self.class.integration_model_klass.to_s.split('::').last.downcase, 
        started_at: Time.current
      )
      begin
        run!(integration, start_date: sync.previous_successful_sync&.completed_at || 30.days.ago)
        sync.completed!
    rescue => e
        Rails.logger.error "#{self.class.to_s} sync failed for workspace #{integration.workspace.id} with error: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        sync.failed!(e.message)
      end
    end

    def run!
      raise NotImplementedError, "Subclass #{self.class.name} must implement #run!"
    end
  end
end