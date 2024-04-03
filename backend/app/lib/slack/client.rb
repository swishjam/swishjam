module Slack
  class Client
    class BadRequestError < StandardError; end;
    API_BASE_URL = 'https://slack.com/api/'

    def initialize(access_token)
      @access_token = access_token
    end

    def list_channels(cursor: nil, exclude_archived: true, limit: 100, types: 'public_channel, private_channel')
      # dumb hack to get around Slack API weird behavior getting multiple channel types
      types.split(',').map do |type|
        params = { 
          limit: limit, 
          types: type,
          exclude_archived: exclude_archived,
        }
        params[:cursor] = cursor if cursor.present?
        response = get('conversations.list', params)
        response['channels']
      end.flatten
    end

    def post_message_to_channel(channel:, text: nil, blocks: nil, thread_ts: nil, metadata_event_type: nil, metadata_event_payload: {}, unfurl_links: true, unfurl_media: true, __bypass_dev_flag: false)
      raise BadRequestError, "`post_message_to_channel` must contain either `text` or `blocks` argument." if text.blank? && blocks.blank?
      byebug
      if !Rails.env.production? && ENV['ENABLE_SLACK_NOTIFICATIONS_IN_DEV'] != 'true' && !__bypass_dev_flag
        Rails.logger.info("\nWould have sent Slack message to channel #{channel} with text: #{text} and blocks: #{blocks}\n")
      else
        payload = { channel: channel }
        if metadata_event_type.present? && metadata_event_payload.present?
          payload[:metadata] = {
            event_type: metadata_event_type,
            event_payload: metadata_event_payload,
          }.to_json
        end
        payload[:text] = text if text.present?
        payload[:unfurl_links] = unfurl_links
        payload[:unfurl_media] = unfurl_media
        payload[:blocks] = blocks.to_json if blocks.present?
        payload[:thread_ts] = thread_ts if thread_ts.present?
        post('chat.postMessage', payload)
      end
    end

    def list_teams
      get('auth.teams.list')['teams']
    end

    def retrieve_user(user_id)
      get('users.info', user: user_id)['user']
    end

    def open_modal(trigger_id:, title:, blocks:, callback_id:, submit_button_text: "Submit", close_button_text: "Cancel", private_metadata: {}, clear_on_close: true)
      post('views.open', {
        trigger_id: trigger_id,
        view: {
          type: "modal",
          callback_id: callback_id || "#{title.parameterize.underscore}_modal",
          private_metadata: private_metadata.to_json,
          clear_on_close: clear_on_close,
          title: {
            type: "plain_text",
            text: title
          },
          submit: {
            type: "plain_text",
            text: submit_button_text,
          },
          close: {
            type: "plain_text",
            text: close_button_text,
          },
          blocks: blocks,
        }.to_json
      })
    end

    def add_reaction_to_message(channel:, message_ts:, emoji:)
      post('reactions.add', { channel: channel, timestamp: message_ts, name: emoji })
    end

    private

    def get(endpoint, params = {})
      request(:get, endpoint, query: params)
    end

    def post(endpoint, payload = {})
      request(:post, endpoint, body: payload)
    end

    def request(method, endpoint, options = {})
      headers = { 'Authorization' => "Bearer #{@access_token}" }
      resp = HTTParty.send(method, API_BASE_URL + endpoint, options.merge(headers: headers))
      json = JSON.parse(resp.body)
      raise BadRequestError, json['error'] if json['error']
      json
    end
  end
end