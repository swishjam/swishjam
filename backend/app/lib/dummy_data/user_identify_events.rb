module DummyData
  class UserIdentifyEvents
    class << self
      def create_user_identify_events!(workspace:, user_profiles:, device_identifiers:)
        progress_bar = TTY::ProgressBar.new("Creating random number of user identify events for #{user_profiles.count} users [:bar]", total: user_profiles.count, bar_format: :block)
        total_identify_events = 0

        user_profiles.each do |user_profile|
          num_of_devices_for_user = rand(1..2)
          identify_events_for_user = num_of_devices_for_user.times.map do |i|
            identify = Analytics::UserIdentifyEvent.create!(
              swishjam_api_key: workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key,
              device_identifier: device_identifiers.sample,
              swishjam_user_id: user_profile.id,
              occurred_at: Faker::Time.between(from: 1.year.ago, to: Time.now),
            )
            total_identify_events += 1
            identify
          end
          progress_bar.advance
          # create a login from a different user in the past for 10% of users
          # this ensures our logic for attributing events to users is correct
          next unless rand() < 0.1 
          # other_user = user_profiles.where.not(id: user_profile.id).sample
          other_user = user_profiles.sample
          Analytics::UserIdentifyEvent.create!(
            swishjam_api_key: workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key,
            device_identifier: device_identifiers.sample,
            swishjam_user_id: other_user.id,
            occurred_at: identify_events_for_user.first.occurred_at - 10.minutes,
          )
          total_identify_events += 1
        end
        puts "Created #{total_identify_events} user identify events!".colorize(:green)
        puts "\n"
      end
    end
  end
end