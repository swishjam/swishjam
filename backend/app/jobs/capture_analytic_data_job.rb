EVENT_PROCESSOR_KLASS_DICT = {
  page: AnalyticsEventProcessors::PageView,
  identify: AnalyticsEventProcessors::Identify,
  organization: AnalyticsEventProcessors::Organization,
}

class CaptureAnalyticDataJob
  class InvalidApiKeyError < StandardError; end
  include Sidekiq::Job
  queue_as :default

  def perform(api_key, event_payload)
    start = Time.now
    verify_api_key!(api_key)
    event_payload.each do |event_json|
      processor_klass = EVENT_PROCESSOR_KLASS_DICT.with_indifferent_access[event_json['type']] || AnalyticsEventProcessors::Custom
      begin
        processor_klass.new(api_key, event_json).process!
      rescue => e
        Rails.logger.error "Error processing event: #{e.message}"
        Rails.logger.error event_json
        Rails.logger.error e.backtrace.join("\n")
      end
    end
    Rails.logger.info "Processed #{event_payload.length} events in #{Time.now - start} seconds for #{api_key} instance."
  end

  private

  def verify_api_key!(api_key)
    Swishjam::Organization.find_by!(public_key: api_key)
  rescue ActiveRecord::RecordNotFound => e
    raise InvalidApiKeyError, "Invalid API key provided to `CaptureAnalyticDataJob`: #{api_key}"
  end
end