module Slack
  module SwishjamBot
    module ActionHandlers
      class BlockActions < Slack::SwishjamBot::Base
        def initialize(integration, payload)
          @integration = integration
          @payload = payload
        end

        def handle_action
          with_timeout_handling do
            @payload['actions'].each do |action|
              case action['action_id']
              when Slack::SwishjamBot::Actions.DISPLAY_EMAIL_MODAL
                Slack::SwishjamBot::ActionHandlers::BlockActions::DisplayEmailModal.new(@integration, @payload, action).handle_action
              when Slack::SwishjamBot::Actions.VISIT_USER_PROFILE
                # log?
              else
                raise ArgumentError, "Invalid action_id #{action['action_id']}"
              end
            end.compact
          end
        end

      end
    end
  end
end