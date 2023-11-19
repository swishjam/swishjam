module GoogleApis
  class Search
    class RequestError < StandardError; end
    BASE_URL = 'https://www.googleapis.com/webmasters/v3/sites'

    def initialize(integration)
      @integration = integration
    end

    def get_analytics(site_url, start_date: 1.month.ago, end_date: Time.current, dimensions: ['date'], row_limit: 10_000)
      data = run_with_refresh do 
        HTTParty.post("#{BASE_URL}/#{site_url}/searchAnalytics/query?access_token=#{@integration.access_token}", {
          body: {
            startDate: start_date.strftime('%Y-%m-%d'),
            endDate: end_date.strftime('%Y-%m-%d'),
            dimensions: dimensions,
            rowLimit: row_limit,
          }.to_json,
          headers: { 'Content-Type' => 'application/json' }
        })
      end
      data['rows']
    end

    def get_sites
      data = run_with_refresh{ HTTParty.get("#{BASE_URL}?access_token=#{@integration.access_token}") }
      data['siteEntry']
    end

    def get_and_save_sites
      sites = get_sites
      @integration.update!(config: @integration.config.merge({ sites: sites }))
      sites
    end

    private

    def run_with_refresh(&block)
      refresh! if @integration.expired?
      response = yield
      if response.code == 401
        refresh!
        run_with_refresh(&block)
      elsif response.code != 200
        Sentry.capture_message("Google Search Console API error", extra: { response: response.body })
        raise RequestError, JSON.parse(response.body).dig('error', 'message') || "An unexpected error occurred."
      end
      response
    end

    def refresh!
      @integration = GoogleApis::Auth::RefreshAccessToken.refresh_integrations_auth_token!(@integration)
    end
  end
end