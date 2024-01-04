module ProfileEnrichers
  module UserEnrichers
    class Octolane < ProfileEnrichers::Base
      def params
        {
          email: enrichable.email,
          name: enrichable.full_name,
        }
      end

      def make_enrichment_request!
        if enrichable.email.blank?
          return enrichment_response(success: false, error_message: 'No email address provided.')
        end
        
        resp = HTTParty.post('https://enrich.octolane.com/v1/person-by-email', {
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
