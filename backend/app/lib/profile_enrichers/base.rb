module ProfileEnrichers
  class Base
    attr_reader :enrichable, :workspace
    
    def initialize(enrichable)
      @enrichable = enrichable
      @workspace = enrichable.workspace
    end

    def params
      raise NotImplementedError, "Must implement `params` in subclass #{self.class}."
    end

    def make_enrichment_request!
      raise NotImplementedError, "Must implement `make_enrichment_request!` in subclass #{self.class}."
    end

    def try_to_enrich!
      enrichment_attempt = EnrichmentAttempt.new(
        workspace: enrichable.workspace,
        enrichable: enrichable,
        attempted_payload: params,
        enrichment_service: self.class.to_s.split('::').last,
      )
      enrichment_results = make_enrichment_request!
      if enrichment_results.successful?
        enriched_data = EnrichedData.create!(
          workspace: enrichable.workspace,
          enrichable: enrichable,
          enrichment_service: self.class.to_s.split('::').last,
          data: enrichment_results.data,
        )
        enrichment_attempt.enriched_data = enriched_data
        enrichment_attempt.successful = true
        enrichment_attempt.save!
        enriched_data
      else
        enrichment_attempt.error_message = enrichment_results.error_message
        enrichment_attempt.successful = false
        enrichment_attempt.save!
        false
      end
    end

    def enrichment_response(success:, data: {}, error_message: nil)
      OpenStruct.new(
        successful: success,
        successful?: success,
        data: data,
        error_message: error_message,
        failed?: !success,
      )
    end
  end
end