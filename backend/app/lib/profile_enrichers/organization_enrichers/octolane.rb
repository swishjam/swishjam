module ProfileEnrichers
  module OrganizationEnrichers
    class Octolane < ProfileEnrichers::Base
      def params
        {
          domain: enrichable.domain,
          company_name: enrichable.name,
        }
      end

      def make_enrichment_request!
        if params[:domain].blank?
          return enrichment_response(success: false, error_message: 'Cannot enrich an Organization without a domain.')
        end
        
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
      rescue => e
        Sentry.capture_exception(e)
        enrichment_response(success: false, error_message: "swishjam_uncaught_exception: #{e.message}")
      end
    end
  end
end
