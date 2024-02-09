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

    def post_message_to_channel(channel:, text: nil, blocks: nil, unfurl_links: true, unfurl_media: true)
      raise BadRequestError, "`post_message_to_channel` must contain either `text` or `blocks` argument." if text.blank? && blocks.blank?
      if !Rails.env.production? && ENV['ENABLE_SLACK_NOTIFICATIONS_IN_DEV'] != 'true'
        Rails.logger.info("\nWould have sent Slack message to channel #{channel} with text: #{text} and blocks: #{blocks}\n")
      else
        payload = { channel: channel }
        payload[:text] = text if text.present?
        payload[:unfurl_links] = unfurl_links
        payload[:unfurl_media] = unfurl_media
        payload[:blocks] = blocks.to_json if blocks.present?
        response = post('chat.postMessage', payload)
      end
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