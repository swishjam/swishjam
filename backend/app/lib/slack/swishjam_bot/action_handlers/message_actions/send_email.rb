module Slack
  module SwishjamBot
    module ActionHandlers
      module MessageActions
        class SendEmail < Slack::SwishjamBot::Base
          def initialize(integration, payload)
            @integration = integration
            @payload = payload
            user_id = @payload.dig('message', 'metadata', 'event_payload', 'analytics_user_profile_id')
            @user_to_deliver_email_to = @integration.workspace.analytics_user_profiles.find(user_id)

            slack_user_profile = @integration.api_client.retrieve_user(payload['user']['id'])
            @email_to_deliver_from = slack_user_profile.dig('profile', 'email')
          end

          def handle_action
            @integration.api_client.open_modal(
              trigger_id: @payload['trigger_id'],
              title: "Send Email",
              callback_id: Slack::SwishjamBot::ActionCallbacks.SEND_EMAIL,
              private_metadata: {
                analytics_user_profile_id: @user_to_deliver_email_to.id,
                message_ts: @payload['message_ts'],
                channel_id: @payload.dig('channel', 'id'),
              },
              blocks: [
                {
                  type: "input",
                  block_id: "to_email",
                  label: {
                    text: "To:",
                    type: "plain_text",
                  },
                  element: {
                    type: "email_text_input",
                    action_id: "to_email",
                    initial_value: @user_to_deliver_email_to.email,
                    placeholder: {
                      text: "jenny@swishjam.com",
                      type: "plain_text"
                    }
                  }
                },
                {
                  type: "input",
                  block_id: "from_email",
                  label: {
                    text: "From:",
                    type: "plain_text"
                  },
                  element: {
                    type: "email_text_input",
                    action_id: "from_email",
                    focus_on_load: true,
                    # a slack bug?? if we have multiple initial values, it displays a validation error
                    # initial_value: @email_to_deliver_from,
                    placeholder: {
                      text: "from-jenny@swishjam.com",
                      type: "plain_text"
                    }
                  }
                },
                {
                  type: "input",
                  block_id: "subject",
                  label: {
                    text: "Subject:",
                    type: "plain_text"
                  },
                  element: {
                    type: "plain_text_input",
                    action_id: "subject",
                    placeholder: {
                      text: "Subject line",
                      type: "plain_text"
                    }
                  }
                },
                {
                  type: "input",
                  block_id: "body",
                  label: {
                    text: "Body:",
                    type: "plain_text"
                  },
                  element: {
                    type: "plain_text_input",
                    multiline: true,
                    action_id: "body",
                    placeholder: {
                      text: "Email body",
                      type: "plain_text"
                    }
                  }
                },
              ]
            )
          end
        end
      end
    end
  end
end