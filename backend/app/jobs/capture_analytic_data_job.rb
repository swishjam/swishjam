EVENT_PROCESSOR_KLASS_DICT = {
  page: AnalyticsEventProcessors::PageView,
  identify: AnalyticsEventProcessors::Identify,
}

class CaptureAnalyticDataJob
  include Sidekiq::Job
  queue_as :default

  def perform(api_key, data)
    start = Time.now
    data.each do |raw_event|
      processor_klass = EVENT_PROCESSOR_KLASS_DICT.with_indifferent_access[raw_event['type']] || AnalyticsEventProcessors::Custom
      begin
        processor_klass.new(api_key, raw_event).process!
      rescue => e
        Rails.logger.error "Error processing event: #{e.message}"
        Rails.logger.error raw_event
        Rails.logger.error e.backtrace.join("\n")
      end
    end
    Rails.logger.info "Processed #{data.length} events in #{Time.now - start} seconds for #{api_key} instance."
  end
end