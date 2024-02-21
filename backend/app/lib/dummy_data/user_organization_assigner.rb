module DummyData
  class UserOrganizationAssigner
    class << self
      def assign_user_profiles_to_organization_profiles!(users, organizations)
        progress_bar = TTY::ProgressBar.new("Assigning #{users.count} user profiles to a random number of organization profiles (1-4) [:bar]", total: users.count, bar_format: :block)
        users.each do |user_profile|
          rand(0..4).times do
            if !AnalyticsOrganizationMember.create(analytics_user_profile_id: user_profile.id, analytics_organization_profile_id:  organizations.sample.id)
              puts "Failed to assign user profile #{user_profile.id} to organization profile #{organizations.sample.id}".colorize(:red)
            end
          end
          progress_bar.advance
        end
        puts "\n"
      end
    end
  end
end