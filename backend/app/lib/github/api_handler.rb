module Github
  class ApiHandler
    # TODO: these dont work until we have a way to deploy the .pem file
    def initialize(integration)
      @integration = integration
      @installation_id = integration.installation_id
    end

    def repos_installation_has_access_to
      @repo_installation_has_access_to ||= get("/installation/repositories")['repositories'].map do |repo|
        {
          name: repo['name'],
          full_name: repo['full_name'],
          owner: repo['owner']['login'],
          owner_id: repo['owner']['id'],
          owner_type: repo['owner']['type'],
        }.with_indifferent_access
      end
    end

    def get_pull_requests(status: 'all', owner: nil, repo: nil)
      # idk why status won't work as a param
      get_with_owner_and_repo_or_all("pulls?status=#{status}", owner: owner, repo: repo)
    end

    def get_deployments(owner: nil, repo: nil)
      get_with_owner_and_repo_or_all("deployments", owner: owner, repo: repo)
    end

    def get_github_repo_page_views(owner: nil, repo: nil)
      get_with_owner_and_repo_or_all("traffic/views", owner: owner, repo: repo)
    end

    def get_github_repo_referrals(owner: nil, repo: nil)
      get_with_owner_and_repo_or_all("traffic/popular/referrers", owner: owner, repo: repo)
    end

    def get_github_repo_clones(owner: nil, repo: nil)
      get_with_owner_and_repo_or_all("traffic/clones", owner: owner, repo: repo)
    end

    private

    def get_with_owner_and_repo_or_all(endpoint, owner: nil, repo: nil)
      if owner && repo
        get("/repos/#{owner}/#{repo}/#{endpoint}")
      else
        repos_installation_has_access_to.map do |repo|
          {
            repo: repo[:full_name],
            data: get("/repos/#{repo[:owner]}/#{repo[:name]}/#{endpoint}"),
          }.with_indifferent_access
        end
      end
    end

    def refresh_access_token
      resp = post("/app/installations/#{@installation_id}/access_tokens", {}, use_jwt: true)
      @integration.config['access_token'] = resp['token']
      @integration.config['expires_at'] = resp['expires_at'].to_datetime
      @integration.save!
    end

    def access_token
      refresh_access_token if token_is_expired?
      @integration.config['access_token']
    end

    def token_is_expired?
      return true if @integration.config['expires_at'].nil?
      @integration.config['expires_at'] <= DateTime.now
    end

    def get(endpoint)
      request(:get, endpoint)
    end

    def post(endpoint, body = {}, use_jwt: false)
      request(:post, endpoint, body, use_jwt: use_jwt)
    end

    def request(method, endpoint, body = {}, use_jwt: false)
      # there's a response header that shows the permissions needed for each endpoint
      HTTParty.send(
        method,
        "https://api.github.com#{endpoint}",
        headers: {
          'Accept' => 'application/vnd.github+json',
          'Authorization' => "Bearer #{use_jwt ? jwt : access_token}",
        },
        body: body.to_json,
      )
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