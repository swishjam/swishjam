module Oauth
  class SlackController < ApplicationController
    def callback
      uri = URI('https://slack.com/api/oauth.v2.access')
      response = Net::HTTP.post_form(uri, {
        client_id: ENV['SLACK_CLIENT_ID'],
        client_secret: ENV['SLACK_CLIENT_SECRET'],
        code: params[:code],
      })
      auth_data = JSON.parse(response.body)
      byebug
      if auth_data['error']
        redirect_to "#{ENV['FRONTEND_URL'] || 'https://app.swishjam.com'}/settings/slack?success=false&error=#{auth_data['error']}"
      else
        workspace_id = validate_token_and_return_workspace_id
        SlackConnection.create!(workspace_id: workspace_id, access_token: auth_data['access_token'])
        redirect_to "#{ENV['FRONTEND_URL'] || 'https://app.swishjam.com'}/settings/slack?success=true"
      end
    end

    private

    def validate_token_and_return_workspace_id
      # make sure a session exists for the token
      token = params[:state]
      AuthSession.find_by!(jwt_value: token)

      # make sure the token is valid
      decoded_token = JWT.decode(token, nil, false)[0]
      raise "Session has expired." if decoded_token['expires_at_epoch'] < Time.now.to_i
      user = User.find(decoded_token['user']['id'])
      JWT.decode(token, user.jwt_secret_key, true, { algorithm: 'HS256' }) 

      decoded_token['current_workspace']['id']
    # rescue => e
    #   raise "Session has expired."
    end
  end
end