module DummyData
  class OrganizationIdentifyEvents
    class << self
      def create_organization_identify_events_for_sessions!(sessions)
        progress_bar = TTY::ProgressBar.new("Creating random number of organization identify events for #{sessions.count} sessions [:bar]", total: sessions.count, bar_format: :block)
        total_identify_events = 0

        sessions.each do |session|
          most_recent_user_identify_event_for_session = Analytics::UserIdentifyEvent.where(device_identifier: session.properties[Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER]).order(occurred_at: :desc).first
          # 10% of sessions that have a user_identify_event will have an organization_identify_event
          # rand() < 0.9
          if most_recent_user_identify_event_for_session
            user = AnalyticsUserProfile.find(most_recent_user_identify_event_for_session.swishjam_user_id)
            Analytics::OrganizationIdentifyEvent.create!(
              swishjam_api_key: most_recent_user_identify_event_for_session.swishjam_api_key,
              swishjam_organization_id: user.analytics_organization_profiles.sample.id,
              device_identifier: session.properties[Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER],
              session_identifier: session.properties[Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER],
              occurred_at: Faker::Time.between(from: 1.year.ago, to: Time.now),
            )
            total_identify_events += 1
          end
          progress_bar.advance
        end
        puts "Created #{total_identify_events} organization identify events! (#{total_identify_events.to_f/sessions.count}% of sessions belongs to an organization)"
        puts "\n"
      end
    end
  end
end