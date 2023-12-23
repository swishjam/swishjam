module DummyData
  class UserProfiles
    class << self
      REFERRER_OPTIONS = %w[https://google.com https://twitter.com https://facebook.com https://hackernews.com https://ycombinator.com https://tiktok.com https://producthunt.com https://youtube.com https://reddit.com]

      def generate!(workspace:, number_of_users:, data_begins_max_number_of_days_ago:, initial_url_options:)
        progress_bar = TTY::ProgressBar.new("Seeding #{number_of_users} user profiles [:bar]", total: number_of_users, bar_format: :block)

        users = number_of_users.to_i.times.map do
          user = AnalyticsUserProfile.create!(
            workspace: workspace,
            user_unique_identifier: SecureRandom.uuid,
            email: Faker::Internet.email,
            first_name: Faker::Name.first_name,
            last_name: Faker::Name.last_name,
            created_at: rand(0..data_begins_max_number_of_days_ago).days.ago,
            initial_landing_page_url: REFERRER_OPTIONS.sample,
            initial_referrer_url: REFERRER_OPTIONS.sample,
            metadata: Hash.new.tap do |h|
              rand(1..user_attribute_options.count).times do |i|
                h[user_attribute_options[i][:key]] = user_attribute_options[i][:faker_klass].send(user_attribute_options[i][:faker_method])
              end
            end
          )
          progress_bar.advance
          user
        end
        Ingestion::UserProfileClickHouseReplicationIngestion.ingest!
        puts "\n"
        users
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