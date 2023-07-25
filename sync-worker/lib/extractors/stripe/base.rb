require_relative '../../util/http_requester'
require_relative '../base'

module Extractors
  module Stripe
    class Base < Extractors::Extraction
      SUPPORTED_ENDPOINTS = ['charges', 'payment_intents']
      BASE_URL = 'https://api.stripe.com/v1/'

      def self.extract!(sources)
        raise "This method must be implemented in a subclass"
      end

      def self.fetch_all(endpoint, stripe_account_id, limit: 10)
        raise InvalidExtraction, "Endpoint #{endpoint} is not supported. Supported endpoints are #{SUPPORTED_ENDPOINTS.join(', ')}" unless SUPPORTED_ENDPOINTS.include?(endpoint)
        raise InvalidExtraction, "`stripe_account_id` is required" if !stripe_account_id 
        if ENV['MOCK_HTTP_RESPONSE_DATA']
          JSON.parse(File.read('data/mocks/stripe/charges.json'))
        else
          records = []
          has_next_page = true
          starting_after = nil
          while has_next_page
            query_params = { limit: limit }
            query_params[:starting_after] = starting_after if starting_after
            headers = { "Authorization" => "Bearer #{ENV['STRIPE_SECRET_KEY']}", 'Stripe-Account' => stripe_account_id }
            response = HttpRequester.get("#{BASE_URL}#{endpoint}", query: query_params, headers: headers)
            records += response['data']
            has_next_page = response['has_more']
            starting_after = response['data'].last['id']
          end
          records
        end
      end
    end
  end
end