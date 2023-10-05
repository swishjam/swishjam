class Instrumentation::SdkError < StandardError;

module WebEventProcessors
  class SdkError < Base
    def capture!
      Rails.logger.error "SDK Error reported to ingestion: #{properties.error.inspect}"
      raise Instrumentation::SdkError, "SDK Error reported to ingestion: #{properties.error.inspect}"
    end
  end
end