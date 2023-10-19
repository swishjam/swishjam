module DummyData
  class Seeder
    def self.run_seed!
      ActiveRecord::Base.logger.silence do
        prompter = TTY::Prompt.new
        start_time = Time.current

        swishjam_user = UserLogin.prompt_user_for_login_credentials
        url_host, url_paths = Urls.prompt_user_for_urls_to_generate
        number_of_sessions_to_generate = prompter.select("How many sessions would you like to backfill?", [100, 500, 1_000, 5_000, 10_000, 20_000]){ |q| q.default 3 }
        number_of_users_to_generate = number_of_sessions_to_generate * 0.6
        workspace = Workspace.create!(name: "#{url_host} (demo)", company_url: url_host)
        device_identifiers = (number_of_users_to_generate * 1.05).to_i.times.map{ SecureRandom.uuid }

        event_name_options = EventsToGenerate.prompt_user_for_or_generate_event_names
        data_begins_max_number_of_days_ago = { 100 => 30, 500 => 60, 1_000 => 90, 5_000 => 180, 10_000 => 365, 20_000 => 365 }[number_of_sessions_to_generate]

        ::Integrations::Stripe.create(workspace: workspace, enabled: true, config: { stubbed: true }) 
        ::Integrations::Resend.create(workspace: workspace, enabled: true, config: { stubbed: true })

        swishjam_user.workspaces << workspace unless swishjam_user.workspaces.include?(workspace)

        puts "Seeding workspace #{workspace.name} with #{number_of_users_to_generate} users.\n\n".colorize(:green)

        users = UserProfiles.generate!(
          workspace: workspace, 
          number_of_users: (number_of_sessions_to_generate * 0.75).to_i,
          data_begins_max_number_of_days_ago: data_begins_max_number_of_days_ago,
        )
        organizations = OrganizationProfiles.generate!(workspace, (number_of_users_to_generate * 0.75).to_i)
        UserOrganizationAssigner.assign_user_profiles_to_organization_profiles!(users, organizations)
        UserIdentifyEvents.create_user_identify_events!(workspace: workspace, user_profiles: users, device_identifiers: device_identifiers)
        
        web_traffic_seeder = WebTraffic.new(
          public_key: workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key, 
          number_of_sessions: number_of_sessions_to_generate, 
          device_identifiers: device_identifiers, 
          url_host: url_host, 
          url_paths: url_paths, 
          event_names: event_name_options, 
          data_begins_max_number_of_days_ago: data_begins_max_number_of_days_ago,
        )
        sessions = web_traffic_seeder.create_sessions_page_views_and_events!

        OrganizationIdentifyEvents.create_organization_identify_events_for_sessions!(sessions)
        BillingData.generate!(workspace)
        Integrations.seed_events!(
          workspace: workspace,
          number_of_stripe_events: number_of_sessions_to_generate * 0.1,
          number_of_resend_events: number_of_sessions_to_generate * 0.1,
          data_begins_max_number_of_days_ago: data_begins_max_number_of_days_ago,
        )

        UserSpecificData.prompt_user_and_generate_user_specific_data_if_necessary(
          workspace: workspace, 
          url_host: url_host, 
          url_paths: url_paths, 
          event_name_options: event_name_options, 
          data_begins_max_number_of_days_ago: data_begins_max_number_of_days_ago
        )
        RetentionData.generate!(workspace)

        puts "Completed seed in #{Time.current - start_time} seconds.".colorize(:green)
      end
    end
  end
end