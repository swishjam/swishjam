module GoogleApis
  module Auth
    class RefreshAccessToken
      class BadAuthenticationError < StandardError; end

      def self.refresh_integrations_auth_token!(integration)
        response = Net::HTTP.post_form(URI('https://oauth2.googleapis.com/token'), {
          client_id: ENV['GOOGLE_CLIENT_ID'],
          client_secret: ENV['GOOGLE_CLIENT_SECRET'],
          refresh_token: integration.refresh_token,
          grant_type: 'refresh_token',
        })
        auth_data = JSON.parse(response.body)
        if auth_data['error'] || !auth_data['access_token']
          msg = "Google oauth refresh error: #{auth_data['error'] || 'No access token: ' + auth_data.to_s}"
          Sentry.capture_message(msg)
          raise BadAuthenticationError, msg
        else
          integration.update!(
            config: integration.config.merge({ 
              access_token: auth_data['access_token'],
              expires_at: auth_data['expires_in']&.seconds&.from_now
            })
          )
          integration
        end
      end
    end
  end
end