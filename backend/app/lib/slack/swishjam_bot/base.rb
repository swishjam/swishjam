module Slack
  module SwishjamBot
    class Base
      def with_timeout_handling(timeout = 3.seconds)
        raise ArgumentError, "Block required" unless block_given?
        start_time = Time.now
        result = yield
        time_elapsed = Time.now - start_time
        if time_elapsed > timeout
          Sentry.capture_message("SwishjamBot command took longer than #{timeout} seconds to execute, user likely received an error response in Slack.")
        end
        result
      end
    end
  end
end