require 'spec_helper'

RSpec.describe Ingestion::UserIdentifiesIngestion do
  before do
    @workspace_1 = FactoryBot.create(:workspace)
    @api_key_1 = @workspace_1.api_keys.first.public_key

    @workspace_2 = FactoryBot.create(:workspace)
    @api_key_2 = @workspace_2.api_keys.first.public_key
  end

  def fill_queue_with(events)
    allow(Ingestion::QueueManager).to receive(:pop_all_records_from_queue).with(Ingestion::QueueManager::Queues.IDENTIFY).and_return(events.map{ |e| JSON.parse(e.to_json) })
    allow(Ingestion::QueueManager).to receive(:read_all_records_from_queue).with(Ingestion::QueueManager::Queues.IDENTIFY).and_return(events.map{ |e| JSON.parse(e.to_json) })
  end

  describe '#ingest!' do
    it 'creates a new analytics_user_profile in Postgres, and a new swishjam_user_profile and user_identify_event in ClickHouse when a new user is provided' do
      timestamp = Time.current
      fill_queue_with([
        { uuid: '123', swishjam_api_key: @api_key_1, name: 'identify', occurred_at: timestamp, properties: { userIdentifier: 'some-unique-user', email: 'collin@swishjam.com', first_name: 'Collin', last_name: 'Schneider', some_other_attribute: 'a value!', device_identifier: 'device!' }},
        { uuid: '456', swishjam_api_key: @api_key_2, name: 'identify', occurred_at: timestamp, properties: { userIdentifier: 'some-unique-user-2', email: 'collin-2@swishjam.com', first_name: 'Collin-2', last_name: 'Schneider-2', 'some_other_attribute-2': 'a value!', device_identifier: 'device-2!' }},
      ])
      
      expect(IngestionBatch.count).to be(0)
      expect(AnalyticsUserProfile.count).to be(0)
      expect(Analytics::SwishjamUserProfile.count).to be(0)
      expect(Analytics::UserIdentifyEvent.count).to be(0)
      
      Ingestion::UserIdentifiesIngestion.new.ingest!

      expect(IngestionBatch.count).to be(1)
      expect(AnalyticsUserProfile.count).to be(2)
      expect(Analytics::SwishjamUserProfile.count).to be(2)
      expect(Analytics::UserIdentifyEvent.count).to be(2)

      expect(IngestionBatch.first.num_records).to be(2)
      expect(IngestionBatch.first.event_type).to eq('user_identify')
      
      expect(@workspace_1.analytics_user_profiles.first.user_unique_identifier).to eq('some-unique-user')
      expect(@workspace_1.analytics_user_profiles.first.email).to eq('collin@swishjam.com')
      expect(@workspace_1.analytics_user_profiles.first.first_name).to eq('Collin')
      expect(@workspace_1.analytics_user_profiles.first.last_name).to eq('Schneider')
      expect(@workspace_1.analytics_user_profiles.first.metadata).to eq({ 'some_other_attribute' => 'a value!' })

      expect(@workspace_2.analytics_user_profiles.first.user_unique_identifier).to eq('some-unique-user-2')
      expect(@workspace_2.analytics_user_profiles.first.email).to eq('collin-2@swishjam.com')
      expect(@workspace_2.analytics_user_profiles.first.first_name).to eq('Collin-2')
      expect(@workspace_2.analytics_user_profiles.first.last_name).to eq('Schneider-2')
      expect(@workspace_2.analytics_user_profiles.first.metadata).to eq({ 'some_other_attribute-2' => 'a value!' })
      
      clickhouse_user_profiles = Analytics::SwishjamUserProfile.all
      expect(clickhouse_user_profiles.collect(&:swishjam_api_key).include?(@api_key_1)).to be(true)
      expect(clickhouse_user_profiles.collect(&:unique_identifier).include?('some-unique-user')).to be(true)
      expect(clickhouse_user_profiles.collect(&:swishjam_user_id).include?(@workspace_1.analytics_user_profiles.first.id)).to be(true)

      expect(clickhouse_user_profiles.collect(&:swishjam_api_key).include?(@api_key_2)).to be(true)
      expect(clickhouse_user_profiles.collect(&:unique_identifier).include?('some-unique-user-2')).to be(true)
      expect(clickhouse_user_profiles.collect(&:swishjam_user_id).include?(@workspace_2.analytics_user_profiles.first.id)).to be(true)

      clickhouse_identify_events = Analytics::UserIdentifyEvent.all
      expect(clickhouse_identify_events.collect(&:swishjam_api_key).include?(@api_key_1)).to be(true)
      expect(clickhouse_identify_events.collect(&:device_identifier).include?('device!')).to be(true)
      expect(clickhouse_identify_events.collect(&:swishjam_user_id).include?(@workspace_1.analytics_user_profiles.first.id)).to be(true)

      expect(clickhouse_identify_events.collect(&:swishjam_api_key).include?(@api_key_2)).to be(true)
      expect(clickhouse_identify_events.collect(&:device_identifier).include?('device-2!')).to be(true)
      expect(clickhouse_identify_events.collect(&:swishjam_user_id).include?(@workspace_2.analytics_user_profiles.first.id)).to be(true)
    end

    it 'updates the analytics_user_profile in Postgres, and creates a new user_identify_event in ClickHouse when a user already exists for the unique identifier' do
      @workspace_1.analytics_user_profiles.create!(
        user_unique_identifier: 'some-unique-user', 
        email: 'collins-old-email@swishjam.com', 
        first_name: 'Jerry', 
        last_name: 'Jones',
        metadata: { she: 'gone' }
      )

      Analytics::SwishjamUserProfile.create!(
        swishjam_api_key: @api_key_1,
        unique_identifier: 'some-unique-user',
        swishjam_user_id: @workspace_1.analytics_user_profiles.first.id,
      )

      Analytics::UserIdentifyEvent.create!(
        uuid: 'foo!',
        swishjam_api_key: @api_key_1,
        device_identifier: 'some-device?',
        swishjam_user_id: 'foo!!!',
      )

      timestamp = Time.current
      fill_queue_with([
        { uuid: '123', swishjam_api_key: @api_key_1, name: 'identify', occurred_at: timestamp, properties: { userIdentifier: 'some-unique-user', email: 'collin@swishjam.com', first_name: 'Collin', last_name: 'Schneider', some_other_attribute: 'a value!', device_identifier: 'device!' }},
      ])
      
      expect(IngestionBatch.count).to be(0)
      expect(AnalyticsUserProfile.count).to be(1)
      expect(Analytics::SwishjamUserProfile.count).to be(1)
      expect(Analytics::UserIdentifyEvent.count).to be(1)
      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).exactly(0).times
      
      Ingestion::UserIdentifiesIngestion.new.ingest!

      expect(IngestionBatch.count).to be(1)
      expect(AnalyticsUserProfile.count).to be(1)
      expect(Analytics::SwishjamUserProfile.count).to be(1)
      expect(Analytics::UserIdentifyEvent.count).to be(2)

      expect(IngestionBatch.first.num_records).to be(1)
      expect(IngestionBatch.first.event_type).to eq('user_identify')
      
      expect(@workspace_1.analytics_user_profiles.first.user_unique_identifier).to eq('some-unique-user')
      expect(@workspace_1.analytics_user_profiles.first.email).to eq('collin@swishjam.com')
      expect(@workspace_1.analytics_user_profiles.first.first_name).to eq('Collin')
      expect(@workspace_1.analytics_user_profiles.first.last_name).to eq('Schneider')
      expect(@workspace_1.analytics_user_profiles.first.metadata).to eq({ 'some_other_attribute' => 'a value!' })

      expect(Analytics::UserIdentifyEvent.where(swishjam_api_key: @api_key_1, device_identifier: 'device!', swishjam_user_id: @workspace_1.analytics_user_profiles.first.id).count).to be(1)
    end

    it 'pushes the records back into the queue if it fails' do
      expect(Ingestion::QueueManager).to receive(:push_records_into_queue)
                                          .with(Ingestion::QueueManager::Queues.IDENTIFY, [{ 'invalid_identify_record' => 'foo' }])
                                          .exactly(1).times

      fill_queue_with([{ invalid_identify_record: 'foo' }])

      expect(IngestionBatch.count).to be(0)

      Ingestion::UserIdentifiesIngestion.new.ingest!

      expect(IngestionBatch.first.num_records).to be(1)
      expect(IngestionBatch.first.event_type).to eq('user_identify')
      expect(IngestionBatch.first.error_message).to_not be(nil)
    end
  end
end