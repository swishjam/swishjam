EVENT_PROCESSOR_KLASS_DICT = {
  identify: WebEventProcessors::Identify,
  organization: WebEventProcessors::Organization,
}

class CaptureAnalyticDataJob
  class InvalidApiKeyError < StandardError; end
  include Sidekiq::Job
  queue_as :default

  def perform(api_key, event_payload, requesting_ip_address)
    start = Time.now
    workspace = verify_api_key!(api_key)

    success_count = 0
    failed_count = 0
    event_payload.each do |event_json|
      begin
        event_name = event_json['event']
        processor_klass = EVENT_PROCESSOR_KLASS_DICT[event_name.to_sym] || WebEventProcessors::Event
        processor_klass.new(workspace, event_json).capture!
        success_count += 1
      rescue => e
        Rails.logger.error "Error processing event: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        Rails.logger.error event_json
        failed_count += 1
      end
    end
    Rails.logger.info "Processed #{success_count} events in #{Time.now - start} seconds for #{api_key} instance. #{failed_count} failed."
  end

  private

  def verify_api_key!(api_key)
    Workspace.find_by!(public_key: api_key)
  rescue ActiveRecord::RecordNotFound => e
    raise InvalidApiKeyError, "Invalid API key provided to `CaptureAnalyticDataJob`: #{api_key}"
  end
end