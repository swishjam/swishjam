module DummyData
  class UserProfiles
    class << self
      def generate!(workspace:, number_of_users:, data_begins_max_number_of_days_ago:)
        progress_bar = TTY::ProgressBar.new("Seeding #{number_of_users} user profiles [:bar]", total: number_of_users, bar_format: :block)

        users = number_of_users.to_i.times.map do
          user = AnalyticsUserProfile.create!(
            workspace: workspace,
            user_unique_identifier: SecureRandom.uuid,
            email: Faker::Internet.email,
            first_name: Faker::Name.first_name,
            last_name: Faker::Name.last_name,
            created_at: rand(0..data_begins_max_number_of_days_ago).days.ago,
            metadata: Hash.new.tap do |h|
              rand(1..user_attribute_options.count).times do |i|
                h[user_attribute_options[i][:key]] = user_attribute_options[i][:faker_klass].send(user_attribute_options[i][:faker_method])
              end
            end
          )
          Analytics::SwishjamUserProfile.create!(
            swishjam_api_key: workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key, 
            swishjam_user_id: user.id, 
            created_at: user.created_at
          )
          progress_bar.advance
          user
        end
        puts "\n"
        users
      end

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