module DummyData
  class UserProfiles
    class << self
      REFERRER_OPTIONS = %w[https://google.com https://twitter.com https://facebook.com https://hackernews.com https://ycombinator.com https://tiktok.com https://producthunt.com https://youtube.com https://reddit.com]

      def generate!(workspace:, number_of_users:, data_begins_max_number_of_days_ago:, initial_url_options:)
        progress_bar = TTY::ProgressBar.new("Seeding #{number_of_users} user profiles [:bar]", total: number_of_users, bar_format: :block)

        user_data = number_of_users.to_i.times.map do
          ts = rand(0..data_begins_max_number_of_days_ago).days.ago
          profile_json = {
            workspace_id: workspace.id,
            user_unique_identifier: SecureRandom.uuid,
            email: Faker::Internet.email,
            created_at: ts,
            updated_at: ts,
            metadata: Hash.new.tap do |h|
              h['first_name'] = Faker::Name.first_name
              h['last_name'] = Faker::Name.last_name
              h[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL] = initial_url_options.sample
              h[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL] = REFERRER_OPTIONS.sample
              rand(1..user_attribute_options.count).times do |i|
                h[user_attribute_options[i][:key]] = user_attribute_options[i][:faker_klass].send(user_attribute_options[i][:faker_method])
              end
            end
          }
          progress_bar.advance
          profile_json
        end
        AnalyticsUserProfile.insert_all!(user_data)
        all_profiles = workspace.analytics_user_profiles
        Ingestion::QueueManager.push_records_into_queue(
          Ingestion::QueueManager::Queues.CLICK_HOUSE_USER_PROFILES, 
          all_profiles.map(&:formatted_for_clickhouse_replication)
        )
        puts "\n"
        all_profiles
      end

      private

      def user_attribute_options
        [
          { key: 'Favorite beer', faker_klass: Faker::Beer, faker_method: 'name' },
          { key: 'Personal bank', faker_klass: Faker::Bank, faker_method: 'name' },
          { key: 'College attended', faker_klass: Faker::University, faker_method: 'name' },
          { key: 'Favorite color', faker_klass: Faker::Color, faker_method: 'color_name' },
          { key: 'Favorite superhero', faker_klass: Faker::DcComics, faker_method: 'hero' },
          { key: 'Favorite hobby', faker_klass: Faker::Hobby, faker_method: 'activity' },
        ]
      end
    end
  end
end