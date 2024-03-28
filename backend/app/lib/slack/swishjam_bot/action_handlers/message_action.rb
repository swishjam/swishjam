module Slack
  module SwishjamBot
    module ActionHandlers
      class MessageAction
        def initialize(integration, payload)
          @integration = integration
          @payload = payload
        end

        def handle_action
          case @payload['callback_id']
          when Slack::SwishjamBot::Actions.DISPLAY_EMAIL_MODAL
            Slack::SwishjamBot::ActionHandlers::MessageActions::SendEmail.new(@integration, @payload).handle_action
          else
            raise "Invalid callback_id #{payload['callback_id']}"
          end
        end
      end
    end
  end
end