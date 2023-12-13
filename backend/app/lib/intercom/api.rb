module Intercom
  class Api
    def initialize(access_token)
      @access_token = access_token
    end

    def get_account_details
      get('/me')
    end

    private

    def get(endpoint)
      HTTParty.get("https://api.intercom.io#{endpoint}", headers: { 'Authorization' => "Bearer #{@access_token}" })
    end
  end
end