module Slack
  module SwishjamBot
    module ActionHandlers
      class ViewSubmission < Slack::SwishjamBot::Base
        class InvalidSubmissionError < StandardError; end

        def initialize(integration, payload)
          @integration = integration
          @payload = payload
        end

        def handle_action
          case @payload['view']['callback_id']
          when Slack::SwishjamBot::ActionCallbacks.SEND_EMAIL
            Slack::SwishjamBot::ActionHandlers::ViewSubmissions::SendEmail.new(@integration, @payload).handle_view_submission
          else
            raise "Invalid callback_id #{payload['view']['callback_id']}"
          end
        end

      end
    end
  end
end