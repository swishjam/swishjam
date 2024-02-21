module DummyData
  class OrganizationProfiles
    class << self
      def generate!(workspace:, num_of_organizations:, data_begins_max_number_of_days_ago:)
        progress_bar = TTY::ProgressBar.new("Seeding #{num_of_organizations} organization profiles [:bar]", total: num_of_organizations, bar_format: :block)
        organization_data = num_of_organizations.to_i.times.map do
          ts = rand(0..data_begins_max_number_of_days_ago).days.ago
          org_json = {
            workspace_id: workspace.id, 
            name: Faker::Company.name, 
            domain: Faker::Internet.domain_name,
            organization_unique_identifier: SecureRandom.uuid,
            created_at: ts,
            updated_at: ts,
            metadata: Hash.new.tap do |h|
              rand(1..organization_attribute_options.count).times do |i|
                h[organization_attribute_options[i][:key]] = organization_attribute_options[i][:faker_klass].send(organization_attribute_options[i][:faker_method])
              end
            end
          }
          progress_bar.advance
          org_json
        end
        AnalyticsOrganizationProfile.insert_all!(organization_data)
        all_orgs = workspace.analytics_organization_profiles
        Ingestion::QueueManager.push_records_into_queue(
          Ingestion::QueueManager::Queues.CLICK_HOUSE_ORGANIZATION_PROFILES, 
          all_orgs.map(&:formatted_for_clickhouse_replication)
        )
        puts "\n"
        all_orgs
      end

      def organization_attribute_options
        [
          { key: 'Subscription Plan', faker_klass: Faker::Subscription, faker_method: 'plan' },
          { key: 'Industry', faker_klass: Faker::IndustrySegments, faker_method: 'industry' },
        ]
      end
    end
  end
end