module DummyData
  class UserSpecificData
    class << self
      def prompt_user_and_generate_user_specific_data_if_necessary(
        workspace:, 
        url_host:, 
        url_paths:, 
        event_name_options:, 
        data_begins_max_number_of_days_ago:,
        initial_url:
      )
        prompter = TTY::Prompt.new
        should_generate = prompter.select('Generate data for specific user?', ['yes', 'no']){ |q| q.default 'yes' }
        if should_generate == 'yes'
          email = prompter.ask("Enter the email for the user:"){ |q| q.required true }
          first_name = prompter.ask('Enter first name for the user:'){ |q| q.required true }
          last_name = prompter.ask('Enter last name for the user:'){ |q| q.required true }
          metadata = {
            first_name: first_name,
            last_name: last_name,
          }
          metadata[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL] = 'https://reddit.com'
          metadata[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL] = initial_url
          user_profile = AnalyticsUserProfile.create!(
            workspace: workspace, 
            email: email, 
            user_unique_identifier: email,
            metadata: metadata,
          )

          domain_name = email.split('@')[-1]
          organization_name = domain_name.split('.')[0].capitalize
          users_org = AnalyticsOrganizationProfile.create!(workspace: workspace, name: organization_name, organization_unique_identifier: organization_name)
          user_profile.analytics_organization_profiles << users_org

          device_identifier = SecureRandom.uuid
          public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key

          workspace.customer_subscriptions.create!(
            parent_profile: user_profile,
            subscription_provider: 'stripe',
            subscription_provider_object_id: SecureRandom.uuid,
            status: 'active',
            customer_subscription_items_attributes: [{
              subscription_provider_object_id: SecureRandom.uuid,
              product_name: 'Pro',
              quantity: 1,
              price_unit_amount: 7900,
              price_nickname: 'Pro',
              price_billing_scheme: 'per_unit',
              price_recurring_interval: 'month',
              price_recurring_interval_count: 1,
              price_recurring_usage_type: 'licensed',
            }]
          )

          puts "Generating 10 random sessions with events for #{user_profile.email}".colorize(:green)
          web_traffic_seeder = WebTraffic.new(
            public_key: public_key,
            number_of_sessions: nil, 
            user_profile_ids: [user_profile.id], 
            organization_profile_ids: [users_org.id],
            url_host: url_host, 
            url_paths: url_paths, 
            event_names: event_name_options, 
            data_begins_max_number_of_days_ago: data_begins_max_number_of_days_ago,
          )
          event_json = 10.times.map do
            web_traffic_seeder.session_with_page_views_and_events!(user_profile_id: user_profile.id, organization_profile_id: users_org.id, start_time: Time.current - rand(-10..30).days)
          end
          Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.PREPARED_EVENTS, event_json.flatten)

          puts "Generating random Resend and Stripe events for #{user_profile.email}".colorize(:green)
          Integrations.seed_events!(
            workspace: workspace,
            number_of_stripe_events: 10,
            number_of_resend_events: 10,
            number_of_intercom_events: 10,
            data_begins_max_number_of_days_ago: data_begins_max_number_of_days_ago,
            user_profile_id: user_profile.id,
          )
        else
          puts "Not generating specific user data.".colorize(:yellow)
        end
      end
    end
  end
end