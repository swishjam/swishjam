module DummyData
  class UserSpecificData
    class << self
      def prompt_user_and_generate_user_specific_data_if_necessary(workspace:, url_host:, url_paths:, event_name_options:, data_begins_max_number_of_days_ago:)
        prompter = TTY::Prompt.new
        should_generate = prompter.select('Generate data for specific user?', ['yes', 'no']){ |q| q.default 'yes' }
        if should_generate == 'yes'
          email = prompter.ask("Enter the email for the user:"){ |q| q.required true }
          first_name = prompter.ask('Enter first name for the user:'){ |q| q.required true }
          last_name = prompter.ask('Enter last name for the user:'){ |q| q.required true }
          user_profile = AnalyticsUserProfile.create!(workspace: workspace, email: email, first_name: first_name, last_name: last_name, user_unique_identifier: email)

          domain_name = email.split('@')[-1]
          organization_name = domain_name.split('.')[0].capitalize
          user_profile.analytics_organization_profiles << AnalyticsOrganizationProfile.create!(workspace: workspace, name: organization_name, organization_unique_identifier: organization_name)

          device_identifier = SecureRandom.uuid
          public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key
          identify = Analytics::UserIdentifyEvent.create!(
            swishjam_api_key: public_key,
            device_identifier: device_identifier,
            swishjam_user_id: user_profile.id,
            occurred_at: Faker::Time.between(from: 1.year.ago, to: Time.now),
          )

          puts "Generating 10 random sessions with events for #{user_profile.email}".colorize(:green)
          web_traffic_seeder = WebTraffic.new(
            public_key: public_key,
            number_of_sessions: nil, 
            device_identifiers: [device_identifier], 
            url_host: url_host, 
            url_paths: url_paths, 
            event_names: event_name_options, 
            data_begins_max_number_of_days_ago: data_begins_max_number_of_days_ago,
          )
          10.times do
            web_traffic_seeder.create_session_with_page_views_and_events!(device_identifier: device_identifier, start_time: Time.current - rand(-10..30).days)
          end
        else
          puts "Not generating specific user data.".colorize(:yellow)
        end
      end
    end
  end
end