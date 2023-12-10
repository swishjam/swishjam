module Oauth
  class IntercomController < ApplicationController
    def callback
      if params[:error] || !params[:code] || !params[:state]
        redirect_to "#{ENV['FRONTEND_URL'] || 'https://app.swishjam.com'}/data-sources?success=false&message=#{params[:error]}"
        return
      end
      workspace = validate_token_and_return_workspace
      resp = HTTParty.post('https://api.intercom.io/auth/eagle/token', {
        body: {
          code: params[:code],
          client_id: ENV['INTERCOM_CLIENT_ID'],
          client_secret: ENV['INTERCOM_CLIENT_SECRET'],
        }
      })
      auth_data = JSON.parse(resp.body)
      if auth_data['access_token']
        account_details = Intercom::Api.new(auth_data['access_token']).get_account_details
        Integrations::Intercom.create!(
          workspace: workspace,
          config: { 
            access_token: auth_data['access_token'],
            app_id: account_details.dig('app', 'id_code'),
            app_name: account_details.dig('app', 'name'),
          }
        )
        redirect_to "#{ENV['FRONTEND_URL'] || 'https://app.swishjam.com'}/data-sources?success=true&newSource=Intercom"
      else
        redirect_to "#{ENV['FRONTEND_URL'] || 'https://app.swishjam.com'}/data-sources?success=false&message=#{auth_data['error'] || 'Unable to connect to Intercom.'}"
      end
    end

    private

    def validate_token_and_return_workspace
      # make sure a session exists for the token
      token = params[:state]
      AuthSession.find_by!(jwt_value: token) 

      # make sure the token is valid
      decoded_token = JWT.decode(token, nil, false)[0]
      raise "Session has expired." if decoded_token['expires_at_epoch'] < Time.now.to_i
      user = User.find(decoded_token['user']['id'])
      JWT.decode(token, user.jwt_secret_key, true, { algorithm: 'HS256' }) 

      Workspace.find(decoded_token['current_workspace']['id'])
    end
  end
end