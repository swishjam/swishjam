module ProfileEnrichers
  class Base
    attr_reader :enrichable, :workspace

    class << self
      attr_accessor :params_definition
    end
    
    def initialize(enrichable)
      @enrichable = enrichable
      @workspace = enrichable.workspace
    end

    def try_to_enrich!
      enrichment_attempt = EnrichmentAttempt.new(
        workspace: enrichable.workspace,
        enrichable: enrichable,
        attempted_payload: params,
        enrichment_service: self.class.to_s.split('::').last.underscore,
      )
      enrichment_results = try_to_make_enrichment_request!
      if enrichment_results.successful?
        enriched_data = EnrichedData.create!(
          workspace: enrichable.workspace,
          enrichable: enrichable,
          enrichment_service: self.class.to_s.split('::').last.underscore,
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

    private

    def params
      if self.class.params_definition.is_a?(Array)
        json = {}
        self.class.params_definition.each do |param|
          json[param] = enrichable.send(param) if enrichable.send(param).present?
        end
        json
      elsif self.class.params_definition.is_a?(Hash)
        json = {}
        self.class.params_definition.each do |param, enrichable_attr|
          json[param] = enrichable.send(enrichable_attr) if enrichable.send(enrichable_attr).present?
        end
        json
      else
        raise NotImplementedError, "Must define `params_definition` in subclass #{self.class}."
      end
    end

    def try_to_make_enrichment_request!
      if defined?(make_enrichment_request!)
        begin
          if params.empty?
            return enrichment_response(success: false, error_message: "swishjam_no_params_provided: expected to #{enrichable.class.to_s} #{enrichable.id} to have #{self.class.params_definition.is_a?(Array) ? self.class.params_definition.join(', ') : self.class.params_definition.values.join(', ')} attributes, but results were empty.")
          end
          make_enrichment_request!
        rescue => e
          Sentry.capture_exception(e)
          enrichment_response(success: false, error_message: "swishjam_uncaught_exception: #{e.message}")
        end
      else
        raise NotImplementedError, "Must implement `make_enrichment_request!` in subclass #{self.class}."
      end
    end
  end
end