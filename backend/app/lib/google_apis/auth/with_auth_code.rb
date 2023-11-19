module GoogleApis
  module Auth
    class WithAuthCode
      class BadAuthenticationError < StandardError; end

      def self.get_and_save_auth_credentials!(code, workspace_id)
        response = Net::HTTP.post_form(URI('https://oauth2.googleapis.com/token'), {
          client_id: ENV['GOOGLE_CLIENT_ID'],
          client_secret: ENV['GOOGLE_CLIENT_SECRET'],
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: "https://#{ENV['GOOGLE_REDIRECT_HOST'] || 'capture.swishjam.com'}/oauth/google/callback",
        })
        auth_data = JSON.parse(response.body)
        if auth_data['error'] || !auth_data['access_token']
          msg = "Google oauth error: #{auth_data['error'] || 'No access token: ' + auth_data.to_s}"
          Sentry.capture_message(msg)
          raise BadAuthenticationError, msg
        else
          workspace = Workspace.find(workspace_id)
          existing_integration = workspace.integrations.find_by(type: Integrations::GoogleSearchConsole.to_s)
          if existing_integration
            existing_integration.update!(
              config: existing_integration.config.merge({ 
                access_token: auth_data['access_token'], 
                refresh_token: auth_data['refresh_token'], 
                expires_at: auth_data['expires_in']&.seconds&.from_now,
              })
            )
            existing_integration
          else
            Integrations::GoogleSearchConsole.create!(
              workspace_id: workspace_id, 
              enabled: true, 
              config: { 
                access_token: auth_data['access_token'], 
                refresh_token: auth_data['refresh_token'], 
                expires_at: auth_data['expires_in']&.seconds&.from_now
              }
            )
          end
        end
      end
    end
  end
end