
module WebEventProcessors
  class SdkError < Base
    class InstrumentationError < StandardError; end;
    def capture!
      msg = "SDK Error (v #{sdk_version}) reported to ingestion: #{event_json.inspect}"
      Rails.logger.error msg
      raise InstrumentationError, msg
    end
  end
end