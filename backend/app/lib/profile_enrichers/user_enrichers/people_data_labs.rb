module ProfileEnrichers
  module UserEnrichers
    class PeopleDataLabs
      def params
        {
          email: user_profile.email,
          first_name: user_profile.full_name,
          last_name: user_profile.full_name,
        }
      end

      def make_enrichment_request!
        if user_profile.email.blank?
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