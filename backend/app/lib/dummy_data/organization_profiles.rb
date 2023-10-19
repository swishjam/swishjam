module DummyData
  class OrganizationProfiles
    class << self
      def generate!(workspace, num_of_organizations)
        progress_bar = TTY::ProgressBar.new("Seeding #{num_of_organizations} organization profiles [:bar]", total: num_of_organizations, bar_format: :block, )
        organizations = num_of_organizations.to_i.times.map do
          org = AnalyticsOrganizationProfile.create!(
            workspace: workspace, 
            name: Faker::Company.name, 
            organization_unique_identifier: SecureRandom.uuid,
            metadata: Hash.new.tap do |h|
              rand(1..organization_attribute_options.count).times do |i|
                h[organization_attribute_options[i][:key]] = organization_attribute_options[i][:faker_klass].send(organization_attribute_options[i][:faker_method])
              end
            end
          )
          progress_bar.advance
          org
        end
        puts "\n"
        organizations
      end

      def organization_attribute_options
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