module Ingestion
  module EventPreparers
    class StripeEventHandler < Base
      def handle_and_return_new_event_json!
        byebug
      end

      def user_profile_for_event
        @user_profile_for_event ||= begin
          if provided_unique_user_identifier.present?
            workspace.analytics_user_profiles.find_by(user_unique_identifier: provided_unique_user_identifier)
          elsif provided_email.present?
            workspace.analytics_user_profiles.find_by(email: provided_email)
          end
        end
      end

      def stripe_event_type
        parsed_event.properties['type']
      end

      def stripe_event_object_json
        parsed_event.properties.dig('data', 'object')
      end

      def stripe_event_object
      end
    end
  end
end