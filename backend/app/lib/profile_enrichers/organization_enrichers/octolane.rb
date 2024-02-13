module ProfileEnrichers
  module OrganizationEnrichers
    class Octolane < ProfileEnrichers::Base
      self.params_definition = {
        domain: :domain,
        company_name: :name,
      }
      
      def make_enrichment_request!
        resp = HTTParty.post('https://enrich.octolane.com/v1/company', {
          body: params.to_json,
          headers: {
            'Content-Type' => 'application/json',
            'x-api-key' => ENV['OCTOLANE_API_KEY'],
          }
        })
        enrichment_response(
          success: resp['statusCode'] == 200, 
          data: resp['data'] || {},
          error_message: resp['statusCode'] == 200 ? nil : resp['message'],
        )
      end
    end
  end
end
