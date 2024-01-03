require 'spec_helper'

RSpec.describe Ingestion::OrganizationProfilesIngestion do
  before do
    @workspace_1 = FactoryBot.create(:workspace)
    @api_key_1 = @workspace_1.api_keys.first.public_key

    @workspace_2 = FactoryBot.create(:workspace)
    @api_key_2 = @workspace_2.api_keys.first.public_key
  end

  def fill_queue_with(events)
    allow(Ingestion::QueueManager).to receive(:pop_all_records_from_queue).with(Ingestion::QueueManager::Queues.ORGANIZATION).and_return(events.map{ |e| JSON.parse(e.to_json) })
    allow(Ingestion::QueueManager).to receive(:read_all_records_from_queue).with(Ingestion::QueueManager::Queues.ORGANIZATION).and_return(events.map{ |e| JSON.parse(e.to_json) })
  end

  describe '#ingest!' do
    it 'creates new analytics_organization_profiles in Postgres when new org data is provided' do
      IngestionBatch.destroy_all
      AnalyticsOrganizationProfile.destroy_all
      AnalyticsUserProfile.destroy_all

      timestamp = Time.current
      fill_queue_with([
        { uuid: '123', swishjam_api_key: @api_key_1, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization', name: 'Google', some_attribute: 'some value!' }},
        { uuid: '456', swishjam_api_key: @api_key_2, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization-2', name: 'Google-2', 'some_attribute-2': 'some value 2!' }},
      ])
      
      expect(IngestionBatch.count).to be(0)
      expect(AnalyticsOrganizationProfile.count).to be(0)
      expect(Analytics::SwishjamOrganizationProfile.count).to be(0)

      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).exactly(2).times.and_return(true)
      
      Ingestion::OrganizationProfilesIngestion.ingest!

      expect(IngestionBatch.count).to be(1)
      expect(AnalyticsOrganizationProfile.count).to be(2)

      expect(IngestionBatch.first.num_records).to be(2)
      expect(IngestionBatch.first.event_type).to eq('organization_profiles')
      
      expect(@workspace_1.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization')
      expect(@workspace_1.analytics_organization_profiles.first.name).to eq('Google')
      expect(@workspace_1.analytics_organization_profiles.first.metadata).to eq({ 'some_attribute' => 'some value!' })

      expect(@workspace_2.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization-2')
      expect(@workspace_2.analytics_organization_profiles.first.name).to eq('Google-2')
      expect(@workspace_2.analytics_organization_profiles.first.metadata).to eq({ 'some_attribute-2' => 'some value 2!' })
    end

    it 'infers the organization domain from the user email if it is not provided' do
      IngestionBatch.destroy_all
      AnalyticsOrganizationProfile.destroy_all
      AnalyticsUserProfile.destroy_all

      timestamp = Time.current
      fill_queue_with([
        { uuid: '123', swishjam_api_key: @api_key_1, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization', name: 'Google', some_attribute: 'some value!', user_attributes: { email: 'collin@google.com' }}},
        { uuid: '456', swishjam_api_key: @api_key_2, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization-2', name: 'Google-2', 'some_attribute-2': 'some value 2!', user_attributes: { email: 'collin@google-2.com' }}},
      ])

      expect(IngestionBatch.count).to be(0)
      expect(AnalyticsOrganizationProfile.count).to be(0)
      expect(Analytics::SwishjamOrganizationProfile.count).to be(0)

      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).exactly(2).times.and_return(true)
      
      Ingestion::OrganizationProfilesIngestion.ingest!

      expect(IngestionBatch.count).to be(1)
      expect(AnalyticsOrganizationProfile.count).to be(2)

      expect(IngestionBatch.first.num_records).to be(2)
      expect(IngestionBatch.first.event_type).to eq('organization_profiles')
      
      expect(@workspace_1.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization')
      expect(@workspace_1.analytics_organization_profiles.first.name).to eq('Google')
      expect(@workspace_1.analytics_organization_profiles.first.metadata).to eq({ 'some_attribute' => 'some value!' })
      expect(@workspace_1.analytics_organization_profiles.first.domain).to eq('google.com')

      expect(@workspace_2.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization-2')
      expect(@workspace_2.analytics_organization_profiles.first.name).to eq('Google-2')
      expect(@workspace_2.analytics_organization_profiles.first.metadata).to eq({ 'some_attribute-2' => 'some value 2!' })
      expect(@workspace_2.analytics_organization_profiles.first.domain).to eq('google-2.com')
    end

    it 'uses the provided organization domain if it is provided' do
      IngestionBatch.destroy_all
      AnalyticsOrganizationProfile.destroy_all
      AnalyticsUserProfile.destroy_all

      timestamp = Time.current
      fill_queue_with([
        { uuid: '123', swishjam_api_key: @api_key_1, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization', name: 'Google', domain: 'provided-google-domain.com', some_attribute: 'some value!', user_attributes: { email: 'collin@google.com' }}},
        { uuid: '456', swishjam_api_key: @api_key_2, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization-2', name: 'Google-2', 'some_attribute-2': 'some value 2!', user_attributes: { email: 'collin@google-2.com' }}},
      ])

      expect(IngestionBatch.count).to be(0)
      expect(AnalyticsOrganizationProfile.count).to be(0)
      expect(Analytics::SwishjamOrganizationProfile.count).to be(0)

      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).exactly(2).times.and_return(true)
      
      Ingestion::OrganizationProfilesIngestion.ingest!

      expect(IngestionBatch.count).to be(1)
      expect(AnalyticsOrganizationProfile.count).to be(2)

      expect(IngestionBatch.first.num_records).to be(2)
      expect(IngestionBatch.first.event_type).to eq('organization_profiles')
      
      expect(@workspace_1.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization')
      expect(@workspace_1.analytics_organization_profiles.first.name).to eq('Google')
      expect(@workspace_1.analytics_organization_profiles.first.metadata).to eq({ 'some_attribute' => 'some value!' })
      expect(@workspace_1.analytics_organization_profiles.first.domain).to eq('provided-google-domain.com')

      expect(@workspace_2.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization-2')
      expect(@workspace_2.analytics_organization_profiles.first.name).to eq('Google-2')
      expect(@workspace_2.analytics_organization_profiles.first.metadata).to eq({ 'some_attribute-2' => 'some value 2!' })
      expect(@workspace_2.analytics_organization_profiles.first.domain).to eq('google-2.com')
    end

    it 'doesnt infer the organization domain if the user email is generic' do
      IngestionBatch.destroy_all
      AnalyticsOrganizationProfile.destroy_all
      AnalyticsUserProfile.destroy_all

      timestamp = Time.current
      fill_queue_with([
        { uuid: '123', swishjam_api_key: @api_key_1, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization', name: 'Google', some_attribute: 'some value!', user_attributes: { email: 'collin@gmail.com' }}},
        { uuid: '456', swishjam_api_key: @api_key_2, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization-2', name: 'Google-2', 'some_attribute-2': 'some value 2!', user_attributes: { email: 'collin@google-2.com' }}},
      ])

      expect(IngestionBatch.count).to be(0)
      expect(AnalyticsOrganizationProfile.count).to be(0)
      expect(Analytics::SwishjamOrganizationProfile.count).to be(0)

      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).exactly(2).times.and_return(true)
      
      Ingestion::OrganizationProfilesIngestion.ingest!

      expect(IngestionBatch.count).to be(1)
      expect(AnalyticsOrganizationProfile.count).to be(2)

      expect(IngestionBatch.first.num_records).to be(2)
      expect(IngestionBatch.first.event_type).to eq('organization_profiles')
      
      expect(@workspace_1.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization')
      expect(@workspace_1.analytics_organization_profiles.first.name).to eq('Google')
      expect(@workspace_1.analytics_organization_profiles.first.metadata).to eq({ 'some_attribute' => 'some value!' })
      expect(@workspace_1.analytics_organization_profiles.first.domain).to be(nil)

      expect(@workspace_2.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization-2')
      expect(@workspace_2.analytics_organization_profiles.first.name).to eq('Google-2')
      expect(@workspace_2.analytics_organization_profiles.first.metadata).to eq({ 'some_attribute-2' => 'some value 2!' })
      expect(@workspace_2.analytics_organization_profiles.first.domain).to eq('google-2.com')
    end

    it 'updates the analytics_organization_profile in Postgres when one already exists' do
      IngestionBatch.destroy_all
      AnalyticsOrganizationProfile.destroy_all
      AnalyticsUserProfile.destroy_all

      FactoryBot.create(:analytics_organization_profile, workspace: @workspace_1, organization_unique_identifier: 'some-unique-organization', name: 'Google', metadata: { 'old_metadata' => 'some value!' })

      timestamp = Time.current
      fill_queue_with([
        { uuid: '123', swishjam_api_key: @api_key_1, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization', name: 'Google', some_attribute: 'some value!', user_attributes: { email: 'collin@google.com' }}},
        { uuid: '456', swishjam_api_key: @api_key_2, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization-2', name: 'Google-2', 'some_attribute-2': 'some value 2!', user_attributes: { email: 'collin@google-2.com' }}},
      ])

      expect(IngestionBatch.count).to be(0)
      expect(AnalyticsOrganizationProfile.count).to be(1)

      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).exactly(2).times.and_return(true)
      
      Ingestion::OrganizationProfilesIngestion.ingest!

      expect(IngestionBatch.count).to be(1)
      expect(AnalyticsOrganizationProfile.count).to be(2)

      expect(IngestionBatch.first.num_records).to be(2)
      expect(IngestionBatch.first.event_type).to eq('organization_profiles')
      
      expect(@workspace_1.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization')
      expect(@workspace_1.analytics_organization_profiles.first.name).to eq('Google')
      expect(@workspace_1.analytics_organization_profiles.first.metadata).to eq({ 'some_attribute' => 'some value!' })
      expect(@workspace_1.analytics_organization_profiles.first.domain).to eq('google.com')

      expect(@workspace_2.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization-2')
      expect(@workspace_2.analytics_organization_profiles.first.name).to eq('Google-2')
      expect(@workspace_2.analytics_organization_profiles.first.metadata).to eq({ 'some_attribute-2' => 'some value 2!' })
      expect(@workspace_2.analytics_organization_profiles.first.domain).to eq('google-2.com')
    end

    it 'adds the existing user in the user_attributes to the organization_members' do
      IngestionBatch.destroy_all
      AnalyticsOrganizationProfile.destroy_all
      AnalyticsUserProfile.destroy_all
      timestamp = Time.current

      FactoryBot.create(:analytics_user_profile, workspace: @workspace_1, user_unique_identifier: 'my-unique-user', email: 'collin@google.com')
      fill_queue_with([
        { uuid: '123', swishjam_api_key: @api_key_1, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization', name: 'Google', some_attribute: 'some value!', user_attributes: { unique_identifier: 'my-unique-user', email: 'collin@google.com' }}},
        { uuid: '456', swishjam_api_key: @api_key_2, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization-2', name: 'Google-2', 'some_attribute-2': 'some value 2!', user_attributes: { email: 'collin@google-2.com' }}},
      ])

      expect(IngestionBatch.count).to be(0)
      expect(AnalyticsOrganizationProfile.count).to be(0)
      expect(AnalyticsUserProfile.count).to be(1)

      org_profile_replication_enqueue_count = 0
      org_member_replication_enqueue_count = 0
      allow_any_instance_of(AnalyticsOrganizationProfile).to receive(:enqueue_replication_to_clickhouse) { org_profile_replication_enqueue_count += 1 }
      allow_any_instance_of(AnalyticsOrganizationMember).to receive(:enqueue_replication_to_clickhouse) { org_member_replication_enqueue_count += 1 }
      
      Ingestion::OrganizationProfilesIngestion.ingest!

      expect(IngestionBatch.count).to be(1)
      expect(AnalyticsOrganizationProfile.count).to be(2)
      expect(AnalyticsUserProfile.count).to be(1)

      expect(IngestionBatch.first.num_records).to be(2)
      expect(IngestionBatch.first.event_type).to eq('organization_profiles')

      expect(org_profile_replication_enqueue_count).to be(2)
      expect(org_member_replication_enqueue_count).to be(1)
      
      expect(@workspace_1.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization')
      expect(@workspace_1.analytics_organization_profiles.first.name).to eq('Google')
      expect(@workspace_1.analytics_organization_profiles.first.metadata).to eq({ 'some_attribute' => 'some value!' })
      expect(@workspace_1.analytics_organization_profiles.first.domain).to eq('google.com')
      expect(@workspace_1.analytics_organization_profiles.first.analytics_user_profiles.count).to be(1)
      expect(@workspace_1.analytics_organization_profiles.first.analytics_user_profiles.first.user_unique_identifier).to eq('my-unique-user')
      expect(@workspace_1.analytics_organization_profiles.first.analytics_user_profiles.first.email).to eq('collin@google.com')

      expect(@workspace_2.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization-2')
      expect(@workspace_2.analytics_organization_profiles.first.name).to eq('Google-2')
      expect(@workspace_2.analytics_organization_profiles.first.metadata).to eq({ 'some_attribute-2' => 'some value 2!' })
      expect(@workspace_2.analytics_organization_profiles.first.domain).to eq('google-2.com')
    end

    it 'creates a new user from the user_attributes if the user does not exist, and bypasses it when there is no or not enough data in the user_attributes field to create a user' do
      IngestionBatch.destroy_all
      AnalyticsOrganizationProfile.destroy_all
      AnalyticsUserProfile.destroy_all

      timestamp = Time.current

      fill_queue_with([
        { uuid: '123', swishjam_api_key: @api_key_1, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization', name: 'Google', some_attribute: 'some value!', user_attributes: { unique_identifier: 'my-unique-user', email: 'collin@google.com' }}},
        { uuid: '456', swishjam_api_key: @api_key_2, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization-2', name: 'Google-2', 'some_attribute-2': 'some value 2!', user_attributes: { email: 'collin@google-2.com' }}},
      ])

      expect(IngestionBatch.count).to be(0)
      expect(AnalyticsOrganizationProfile.count).to be(0)
      expect(AnalyticsUserProfile.count).to be(0)

      org_profile_replication_enqueue_count = 0
      user_profile_replication_enqueue_count = 0
      org_member_replication_enqueue_count = 0
      allow_any_instance_of(AnalyticsOrganizationProfile).to receive(:enqueue_replication_to_clickhouse) { org_profile_replication_enqueue_count += 1 }
      allow_any_instance_of(AnalyticsUserProfile).to receive(:enqueue_replication_to_clickhouse) { user_profile_replication_enqueue_count += 1 }
      allow_any_instance_of(AnalyticsOrganizationMember).to receive(:enqueue_replication_to_clickhouse) { org_member_replication_enqueue_count += 1 }
      
      Ingestion::OrganizationProfilesIngestion.ingest!

      expect(IngestionBatch.count).to be(1)
      expect(AnalyticsOrganizationProfile.count).to be(2)
      expect(AnalyticsUserProfile.count).to be(1)

      expect(IngestionBatch.first.num_records).to be(2)
      expect(IngestionBatch.first.event_type).to eq('organization_profiles')

      expect(org_profile_replication_enqueue_count).to be(2)
      expect(user_profile_replication_enqueue_count).to be(1)
      expect(org_member_replication_enqueue_count).to be(1)
      
      expect(@workspace_1.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization')
      expect(@workspace_1.analytics_organization_profiles.first.name).to eq('Google')
      expect(@workspace_1.analytics_organization_profiles.first.metadata).to eq({ 'some_attribute' => 'some value!' })
      expect(@workspace_1.analytics_organization_profiles.first.domain).to eq('google.com')
      expect(@workspace_1.analytics_organization_profiles.first.analytics_user_profiles.count).to be(1)
      expect(@workspace_1.analytics_organization_profiles.first.analytics_user_profiles.first.user_unique_identifier).to eq('my-unique-user')
      expect(@workspace_1.analytics_organization_profiles.first.analytics_user_profiles.first.email).to eq('collin@google.com')

      expect(@workspace_2.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization-2')
      expect(@workspace_2.analytics_organization_profiles.first.name).to eq('Google-2')
      expect(@workspace_2.analytics_organization_profiles.first.metadata).to eq({ 'some_attribute-2' => 'some value 2!' })
      expect(@workspace_2.analytics_organization_profiles.first.domain).to eq('google-2.com')
    end
  end
end