module Ingestion
  module EventPreparers
    class ResendEventHandler < Base
      def handle_and_return_prepared_event!
        parsed_event.set_user_profile(user_profile_for_event) if user_profile_for_event.present?
        parsed_event.override_properties!(event_properties)
        parsed_event
      end

      def event_properties
        Hash.new.tap do |hash|
          parsed_event.properties['data'].keys.each do |key|
            val = parsed_event.properties['data'][key]
            if val.is_a?(Array)
              hash[key] = val.join(', ')
              hash["#{key}_array"] = val
            elsif val.is_a?(Hash)
              val.keys.each do |nested_key|
                hash["#{key}_#{nested_key}"] = val[nested_key]
              end
            else
              hash[key] = val
            end
          end
        end
      end

      def user_profile_for_event
        @user_profile_for_event ||= begin
          sent_to_emails = parsed_event.properties.dig('data', 'to')
          return if sent_to_emails.blank?
          resend_email = sent_to_emails[0]
          user_profile = workspace.analytics_user_profiles.find_by(email: resend_email)
          if user_profile.nil?
            user_profile = workspace.analytics_user_profiles.new(email: resend_email, created_by_data_source: ApiKey::ReservedDataSources.RESEND)
          end
          user_profile.metadata['resend_user_email'] ||= resend_email
          user_profile.save! if user_profile.changed?
          user_profile
        end
      end
    end
  end
end