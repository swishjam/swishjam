
module WebEventProcessors
  class SdkError < Base
    class InstrumentationError < StandardError; end;
    def capture!
      msg = "SDK Error (v #{sdk_version}) reported to ingestion: #{event_json.inspect}"
      Sentry.capture_message(msg)
      Rails.logger.error msg
      raise InstrumentationError, msg
    end
  end
end