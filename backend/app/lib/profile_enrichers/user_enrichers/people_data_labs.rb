module ProfileEnrichers
  module UserEnrichers
    class PeopleDataLabs < ProfileEnrichers::Base
      def params
        {
          email: enrichable.email,
          first_name: enrichable.full_name,
          last_name: enrichable.full_name,
        }
      end

      def make_enrichment_request!
        if enrichable.email.blank?
          return enrichment_response(success: false, error_message: 'No email address in user profile to enrich.')
        end

        resp = Peopledatalabs::Enrichment.person(params: params)
        enrichment_response(
          success: resp['status'] == 200, 
          data: (resp['data'] || {}).merge(match_likelihood: resp['likelihood']),
          error_message: resp['status'] == 200 ? nil : "#{enrichment_results.dig('error', 'type') || 'swishjam_unrecognized_error_type'}: #{enrichment_results.dig('error', 'message') || 'No error message provided.'}",
        )
      rescue => e
        Sentry.capture_exception(e)
        enrichment_response(success: false, error_message: "swishjam_uncaught_exception: #{e.message}")
      end
    end
  end
end