module Ingestion
  module EventPreparers
    class CalComEventHandler < Base
      def handle_and_return_prepared_events!
        parsed_event.set_user_profile(user_profile_for_event) if user_profile_for_event.present?
        parsed_event.override_properties!(properties)
        parsed_event
      end

      private

      def properties
        event_properties = {
          'type' => parsed_event.properties.dig('payload', 'type'),
          'title' => parsed_event.properties.dig('payload', 'title'),
          'description' => parsed_event.properties.dig('payload', 'description'),
          'start_time' => parsed_event.properties.dig('payload', 'startTime') ? DateTime.parse(parsed_event.properties.dig('payload', 'startTime')) : '',
          'end_time' => parsed_event.properties.dig('payload', 'endTime') ? DateTime.parse(parsed_event.properties.dig('payload', 'endTime')) : '',
          'length' => parsed_event.properties.dig('payload', 'length'),
          'attendees' => (parsed_event.properties.dig('payload', 'attendees') || []).map{ |a| a['email'] }.join(', '),
        }

        (parsed_event.properties.dig('payload', 'responses') || {}).keys.each do |key|
          value = parsed_event.properties.dig('payload', 'responses', key, 'value')
          next if !value.is_a?(String)
          event_properties["response_#{key}"] = parsed_event.properties.dig('payload', 'responses', key, 'value')
        end
        event_properties
      end

      def user_profile_for_event
        @user_profile_for_event ||= begin
          if parsed_event.properties.dig('payload', 'attendees') && parsed_event.properties.dig('payload', 'attendees').any?
            attendee_email = parsed_event.properties.dig('payload', 'attendees')[0]['email']
            return if attendee_email.blank?
            user_profile = workspace.analytics_user_profiles.find_by(email: attendee_email)
            if user_profile.nil?
              user_profile = workspace.analytics_user_profiles.new(email: attendee_email, created_by_data_source: ApiKey::ReservedDataSources.CAL_COM)
            end
            attendee_name = parsed_event.properties.dig('payload', 'attendees')[0]['name']
            user_profile.metadata['cal_com_name'] = attendee_name if !attendee_name.blank?
            user_profile.save! if user_profile.changed?
            user_profile
          end
        end
      end

    end
  end
end