module ProfileEnrichers
  module UserEnrichers
    class Octolane
      def params
        {
          email: user_profile.email,
          name: user_profile.full_name,
        }
      end

      def make_enrichment_request!
        if user_profile.email.blank?
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
          success: resp['success'], 
          data: resp['data'] || {},
          error_message: resp['success'] ? nil : resp['message'],
        )
      rescue => e
        Sentry.capture_exception(e)
        enrichment_response(success: false, error_message: "swishjam_uncaught_exception: #{e.message}")
      end
    end
  end
end
