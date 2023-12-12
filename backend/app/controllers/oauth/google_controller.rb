module Oauth
  class GoogleController < ApplicationController
    def callback
      integration = GoogleApis::Auth::WithAuthCode.get_and_save_auth_credentials!(params[:code], validate_token_and_return_workspace_id)
      GoogleApis::Search.new(integration).get_and_save_sites
      redirect_to "#{ENV['FRONTEND_URL'] || 'https://app.swishjam.com'}/integrations?success=true&newSource=#{URI.encode_uri_component('Google Search Console')}"
    rescue => e
      Sentry.capture_message("Google oauth error: #{e.message}")
      redirect_to "#{ENV['FRONTEND_URL'] || 'https://app.swishjam.com'}/integrations?error=#{e.message}"
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