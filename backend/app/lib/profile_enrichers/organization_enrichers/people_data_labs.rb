module ProfileEnrichers
  module OrganizationEnrichers
    class PeopleDataLabs < ProfileEnrichers::Base
      self.params_definition = {
        name: :name, 
        website: :domain,
      }

      def make_enrichment_request!
        response = Peopledatalabs::Enrichment.company(params: params)

        formatted_data = response.except('likelihood', 'call_credits_spent', 'call_credits_type', 'rate_limit_reset', 'rate_limit_remaining', 'rate_limit_limit', 'lifetime_used', 'total_limit_remaining', 'total_limit_purchased_remaining', 'total_limit_overages_remaining', 'status')
        formatted_data['match_likelihood'] = response['likelihood'] if response['likelihood'].present?
        enrichment_response(
          success: response['status'] == 200, 
          data: formatted_data,
          error_message: response['status'] == 200 ? nil : response['message'] || 'No error message provided.',
        )
      end
    end
  end
end