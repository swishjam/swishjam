module Slack
  class Client
    class BadRequestError < StandardError; end;
    API_BASE_URL = 'https://slack.com/api/'

    def initialize(access_token)
      @access_token = access_token
    end

    def list_channels(cursor: nil, exclude_archived: false, limit: 100, types: 'public_channel')
      params = { 
        limit: limit, 
        types: types,
        exclude_archived: exclude_archived,
      }
      params[:cursor] = cursor if cursor.present?
      response = get('conversations.list', params)
      response['channels']
    end

    def post_message_to_channel(channel:, text: nil, blocks: nil)
      raise BadRequestError, "`post_message_to_channel` must contain either `text` or `blocks` argument." if text.blank? && blocks.blank?
      payload = { channel: channel }
      payload[:text] = text if text.present?
      payload[:blocks] = blocks if blocks.present?
      response = post('chat.postMessage', payload)
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