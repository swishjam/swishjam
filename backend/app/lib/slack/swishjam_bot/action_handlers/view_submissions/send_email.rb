module Slack
  module SwishjamBot
    module ActionHandlers
      module ViewSubmissions
        class SendEmail
          def initialize(integration, payload)
            @integration = integration
            @payload = payload
          end

          def to_email
            value_from_view_state('to_email')
          end

          def from_email
            value_from_view_state('from_email')
          end

          def subject
            value_from_view_state('subject')
          end

          def body
            value_from_view_state('body')
          end

          def handle_view_submission
            resend_integration = Integrations::Destinations::Resend.for_workspace(@integration.workspace)
            raise Slack::SwishjamBot::ActionHandlers::ViewSubmission::InvalidSubmissionError, "Resend integration not found for workspace" if resend_integration.nil?
            if Rails.env.production? || ENV['SEND_RESEND_EVENT_TRIGGERS_IN_DEVELOPMENT'] == 'true'
              HTTParty.post('https://api.resend.com/emails', 
                body: { from: from_email, to: to_email, subject: subject, text: body }, 
                headers: { 'Authorization' => "Bearer #{resend_integration.api_key}" }
              )
            end
            post_delivery_notification!
            {
              response_action: "update",
              view: {
                type: "modal",
                blocks: [
                  {
                    type: "section",
                    text: {
                      type: "plain_text",
                      text: "Email delivered to #{to_email}."
                    }
                  }
                ]
              }
            }
          end

          def post_delivery_notification!
            if private_metadata['message_ts'].present? && private_metadata['channel_id'].present?
              @integration.api_client.post_message_to_channel(
                channel: private_metadata['channel_id'],
                thread_ts: private_metadata['message_ts'],
                blocks: [
                  {
                    "type": "rich_text_section",
                    "elements": [
                      {
                        "type": "text",
                        "text": "Email delivered to #{to_email}."
                      }
                    ]
                  },
                  {
                    "type": "rich_text_quote",
                    "elements": [
                      {
                        "type": "text",
                        "text": "I am a basic quote block following preformatted text"
                      }
                    ]
                  },
                ],
                __bypass_dev_flag: true,
              )
              begin
                @integration.api_client.add_reaction_to_message(
                  channel: private_metadata['channel_id'],
                  message_ts: private_metadata['message_ts'],
                  emoji: 'inbox_tray'
                )
              rescue Slack::Client::BadRequestError => e
                byebug
                Sentry.capture_exception(e)
              end
            end
          end

          def private_metadata
            @private_metadata ||= JSON.parse(@payload['view']['private_metadata'] || '{}')
          end

          def value_from_view_state(input)
            @payload.dig('view', 'state', 'values', input, input, 'value')
          end
          
        end
      end
    end
  end
end