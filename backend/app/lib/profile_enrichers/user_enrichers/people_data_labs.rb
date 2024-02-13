module ProfileEnrichers
  module UserEnrichers
    class PeopleDataLabs < ProfileEnrichers::Base
      self.params_definition = %i[email first_name last_name]

      def make_enrichment_request!
        resp = Peopledatalabs::Enrichment.person(params: params)
        enrichment_response(
          success: resp['status'] == 200, 
          data: (resp['data'] || {}).merge('match_likelihood' => resp['likelihood']),
          error_message: resp['status'] == 200 ? nil : "#{resp.dig('error', 'type') || 'swishjam_unrecognized_error_type'}: #{resp.dig('error', 'message') || 'No error message provided.'}",
        )
      end
    end
  end
end