module Github
  class ApiHandler
    def initialize(installation_id)
      @installation_id = installation_id
    end

    def jwt
      private_pem = File.read(Rails.root.join('config', 'github-app.pem'))
      private_key = OpenSSL::PKey::RSA.new(private_pem)

      payload = {
        # issued at time, 60 seconds in the past to allow for clock drift
        iat: Time.now.to_i - 60,
        # JWT expiration time (10 minute maximum)
        exp: Time.now.to_i + (10 * 60),
        # GitHub App's identifier
        iss: ENV['SWISHJAM_GITHUB_APP_ID']
      }

      JWT.encode(payload, private_key, "RS256")
    end
  end
end