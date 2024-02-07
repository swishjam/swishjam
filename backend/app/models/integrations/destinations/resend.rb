module Integrations
  module Destinations
    class Resend < Integration
      validate :config_has_required_fields

      def api_key
        config['api_key']
      end

      private

      def config_has_required_fields
        if config['api_key'].blank?
          errors.add(:config, "must have a value for api_key")
        end
      end
    end
  end
end