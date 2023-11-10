require 'spec_helper'

RSpec.describe Ingestion::OrganizationIdentifiesIngestion do
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
    it 'creates a new analytics_organization_profile in Postgres, and a new swishjam_organization_profile and organization_identify_event in ClickHouse when a new user is provided' do
      timestamp = Time.current
      fill_queue_with([
        { uuid: '123', swishjam_api_key: @api_key_1, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization', name: 'Google', organization_device_identifier: 'device!', some_attribute: 'some value!' }},
        { uuid: '456', swishjam_api_key: @api_key_2, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization-2', name: 'Google-2', organization_device_identifier: 'device-2!', 'some_attribute-2': 'some value 2!' }},
      ])
      
      expect(IngestionBatch.count).to be(0)
      expect(AnalyticsOrganizationProfile.count).to be(0)
      expect(Analytics::SwishjamOrganizationProfile.count).to be(0)
      expect(Analytics::OrganizationIdentifyEvent.count).to be(0)
      
      Ingestion::OrganizationIdentifiesIngestion.new.ingest!

      expect(IngestionBatch.count).to be(1)
      expect(AnalyticsOrganizationProfile.count).to be(2)
      expect(Analytics::SwishjamOrganizationProfile.count).to be(2)
      expect(Analytics::OrganizationIdentifyEvent.count).to be(2)

      expect(IngestionBatch.first.num_records).to be(2)
      expect(IngestionBatch.first.event_type).to eq('organization_identify')
      
      expect(@workspace_1.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization')
      expect(@workspace_1.analytics_organization_profiles.first.name).to eq('Google')
      expect(@workspace_1.analytics_organization_profiles.first.metadata).to eq({ 'some_attribute' => 'some value!' })

      expect(@workspace_2.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization-2')
      expect(@workspace_2.analytics_organization_profiles.first.name).to eq('Google-2')
      expect(@workspace_2.analytics_organization_profiles.first.metadata).to eq({ 'some_attribute-2' => 'some value 2!' })
      
      clickhouse_organization_profiles = Analytics::SwishjamOrganizationProfile.all
      expect(clickhouse_organization_profiles.collect(&:swishjam_api_key).include?(@api_key_1)).to be(true)
      expect(clickhouse_organization_profiles.collect(&:unique_identifier).include?('some-unique-organization')).to be(true)
      expect(clickhouse_organization_profiles.collect(&:swishjam_organization_id).include?(@workspace_1.analytics_organization_profiles.first.id)).to be(true)

      expect(clickhouse_organization_profiles.collect(&:swishjam_api_key).include?(@api_key_2)).to be(true)
      expect(clickhouse_organization_profiles.collect(&:unique_identifier).include?('some-unique-organization-2')).to be(true)
      expect(clickhouse_organization_profiles.collect(&:swishjam_organization_id).include?(@workspace_2.analytics_organization_profiles.first.id)).to be(true)

      clickhouse_identify_events = Analytics::OrganizationIdentifyEvent.all
      expect(clickhouse_identify_events.collect(&:swishjam_api_key).include?(@api_key_1)).to be(true)
      expect(clickhouse_identify_events.collect(&:organization_device_identifier).include?('device!')).to be(true)
      expect(clickhouse_identify_events.collect(&:swishjam_organization_id).include?(@workspace_1.analytics_organization_profiles.first.id)).to be(true)

      expect(clickhouse_identify_events.collect(&:swishjam_api_key).include?(@api_key_2)).to be(true)
      expect(clickhouse_identify_events.collect(&:organization_device_identifier).include?('device-2!')).to be(true)
      expect(clickhouse_identify_events.collect(&:swishjam_organization_id).include?(@workspace_2.analytics_organization_profiles.first.id)).to be(true)
    end

    it 'updates the analytics_user_profile in Postgres, and creates a new user_identify_event in ClickHouse when a user already exists for the unique identifier' do
      @workspace_1.analytics_organization_profiles.create!(
        organization_unique_identifier: 'some-unique-organization', 
        name: 'Facebook', 
        metadata: { she: 'gone' }
      )

      Analytics::SwishjamOrganizationProfile.create!(
        swishjam_api_key: @api_key_1,
        unique_identifier: 'some-unique-organization',
        swishjam_organization_id: @workspace_1.analytics_organization_profiles.first.id,
      )

      Analytics::OrganizationIdentifyEvent.create!(
        uuid: 'foo!',
        swishjam_api_key: @api_key_1,
        organization_device_identifier: 'some-device?',
        swishjam_organization_id: 'foo!!!',
      )

      timestamp = Time.current
      fill_queue_with([
        { uuid: '123', swishjam_api_key: @api_key_1, name: 'organization', occurred_at: timestamp, properties: { organizationIdentifier: 'some-unique-organization', name: 'Google', some_other_attribute: 'a value!', organization_device_identifier: 'device!' }},
      ])
      
      expect(IngestionBatch.count).to be(0)
      expect(AnalyticsOrganizationProfile.count).to be(1)
      expect(Analytics::SwishjamOrganizationProfile.count).to be(1)
      expect(Analytics::OrganizationIdentifyEvent.count).to be(1)
      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).exactly(0).times
      
      Ingestion::OrganizationIdentifiesIngestion.new.ingest!

      expect(IngestionBatch.count).to be(1)
      expect(AnalyticsOrganizationProfile.count).to be(1)
      expect(Analytics::SwishjamOrganizationProfile.count).to be(1)
      expect(Analytics::OrganizationIdentifyEvent.count).to be(2)

      expect(IngestionBatch.first.num_records).to be(1)
      expect(IngestionBatch.first.event_type).to eq('organization_identify')
      
      expect(@workspace_1.analytics_organization_profiles.first.organization_unique_identifier).to eq('some-unique-organization')
      expect(@workspace_1.analytics_organization_profiles.first.name).to eq('Google')
      expect(@workspace_1.analytics_organization_profiles.first.metadata).to eq({ 'some_other_attribute' => 'a value!' })

      expect(Analytics::OrganizationIdentifyEvent.where(swishjam_api_key: @api_key_1, organization_device_identifier: 'device!', swishjam_organization_id: @workspace_1.analytics_organization_profiles.first.id).count).to be(1)
    end

    it 'pushes the records back into the queue if it fails' do
      expect(Ingestion::QueueManager).to receive(:push_records_into_queue)
                                          .with(Ingestion::QueueManager::Queues.ORGANIZATION, [{ 'invalid_identify_record' => 'foo' }])
                                          .exactly(1).times

      fill_queue_with([{ invalid_identify_record: 'foo' }])

      expect(IngestionBatch.count).to be(0)

      Ingestion::OrganizationIdentifiesIngestion.new.ingest!

      expect(IngestionBatch.first.num_records).to be(1)
      expect(IngestionBatch.first.event_type).to eq('organization_identify')
      expect(IngestionBatch.first.error_message).to_not be(nil)
    end
  end
end