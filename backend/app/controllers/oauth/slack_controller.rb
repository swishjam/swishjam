module Oauth
  class SlackController < ApplicationController
    def callback
      response = Net::HTTP.post_form(URI('https://slack.com/api/oauth.v2.access'), {
        client_id: ENV['SLACK_CLIENT_ID'],
        client_secret: ENV['SLACK_CLIENT_SECRET'],
        code: params[:code],
        redirect_uri: "https://#{ENV['SLACK_REDIRECT_HOST'] || 'capture.swishjam.com'}/oauth/slack/callback",
      })
      auth_data = JSON.parse(response.body)
      if auth_data['error'] || !auth_data['access_token']
        Sentry.capture_message("Slack oauth error: #{auth_data['error'] || 'No access token: ' + auth_data.to_s}")
        redirect_to "#{ENV['FRONTEND_URL'] || 'https://app.swishjam.com'}/integrations/destinations?success=false&error=#{auth_data['error']}"
      else
        workspace_id = validate_token_and_return_workspace_id
        Integrations::Destinations::Slack.create!(workspace_id: workspace_id, enabled: true, config: { access_token: auth_data['access_token'] })
        # SlackConnection.create!(workspace_id: workspace_id, access_token: auth_data['access_token'])
        redirect_to "#{ENV['FRONTEND_URL'] || 'https://app.swishjam.com'}/integrations/destinations?success=true&integration=slack"
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