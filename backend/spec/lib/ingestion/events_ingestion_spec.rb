require 'spec_helper'

RSpec.describe Ingestion::EventsIngestion do
  def fill_queue_with(events)
    allow(Ingestion::QueueManager).to receive(:pop_all_records_from_queue).with(Ingestion::QueueManager::Queues.EVENTS).and_return(events.map{ |e| JSON.parse(e.to_json) })
    allow(Ingestion::QueueManager).to receive(:read_all_records_from_queue).with(Ingestion::QueueManager::Queues.EVENTS).and_return(events.map{ |e| JSON.parse(e.to_json) })
  end

  describe '#ingest!' do
    it 'writes the events in the queue to ClickHouse events table' do
      occurred_at = 10.minutes.ago
      fill_queue_with([{ uuid: '123', swishjam_api_key: 'stub', name: 'foo', occurred_at: occurred_at, properties: { foo: 'bar' }.to_json  }])

      expect(IngestionBatch.count).to be(0)
      expect(Analytics::Event.count).to be(0)
      
      ingestion_batch = Ingestion::EventsIngestion.ingest!

      expect(ingestion_batch.error_message).to be(nil)

      expect(Analytics::Event.count).to be(1)
      expect(Analytics::Event.first.occurred_at.floor).to eq(occurred_at.floor)
      expect(Analytics::Event.first.swishjam_api_key).to eq('stub')
      expect(Analytics::Event.first.name).to eq('foo')
      expect(JSON.parse(Analytics::Event.first.properties)['foo']).to eq('bar')
      
      expect(IngestionBatch.count).to be(1)
      expect(ingestion_batch.num_records).to be(1)
      expect(ingestion_batch.completed_at).to_not be(nil)
      expect(ingestion_batch.num_seconds_to_complete).to_not be(nil)
      expect(ingestion_batch.error_message).to be(nil)
    end

    it 'enqueues the user identify and organization identify events' do
      IngestionBatch.destroy_all
      occurred_at = 10.minutes.ago
      fill_queue_with([
        { uuid: '123', swishjam_api_key: 'stub', name: 'foo', occurred_at: occurred_at, properties: { foo: 'bar' }  },
        { uuid: '456', swishjam_api_key: 'stub', name: 'identify', occurred_at: occurred_at, properties: { user_unique_identifier: 'unique!', email: 'john@gmail.com' }},
        { uuid: '456-number-2', swishjam_api_key: 'stub-2', name: 'identify', occurred_at: occurred_at, properties: { user_unique_identifier: 'zunique!', email: 'zjohn@gmail.com' }},
        { uuid: '789', swishjam_api_key: 'stub', name: 'organization', occurred_at: occurred_at, properties: { organization_unique_identifier: 'unique!', email: 'Google' }},
      ])

      expect(IngestionBatch.all.count).to be(0)
      expect(Analytics::Event.all.count).to be(0)

      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).with(
        Ingestion::QueueManager::Queues.IDENTIFY, 
        [
          { 'uuid' => '456', 'swishjam_api_key' => 'stub', 'name' => 'identify', 'occurred_at' => occurred_at.iso8601(3), 'properties' => { 'user_unique_identifier' => 'unique!', 'email' => 'john@gmail.com' }},
          { 'uuid' => '456-number-2', 'swishjam_api_key' => 'stub-2', 'name' => 'identify', 'occurred_at' => occurred_at.iso8601(3), 'properties' => { 'user_unique_identifier' => 'zunique!', 'email' => 'zjohn@gmail.com' }},
        ]
      ).exactly(1).times

      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).with(
        Ingestion::QueueManager::Queues.ORGANIZATION, 
        [{ 'uuid' => '789', 'swishjam_api_key' => 'stub', 'name' => 'organization', 'occurred_at' => occurred_at.iso8601(3), 'properties' => { 'organization_unique_identifier' => 'unique!', 'email' => 'Google' }}]
      ).exactly(1).times
      
      ingestion_batch = Ingestion::EventsIngestion.ingest!

      events = Analytics::Event.all
      expect(events.count).to be(4)
      expect(events.collect(&:name).include?('foo')).to be(true)
      expect(events.collect(&:name).include?('identify')).to be(true)
      expect(events.collect(&:name).include?('organization')).to be(true)
      expect(events.collect(&:swishjam_api_key).include?('stub')).to be(true)
      expect(events.collect(&:swishjam_api_key).include?('stub-2')).to be(true)
      
      expect(ingestion_batch.num_records).to be(4)
      expect(ingestion_batch.completed_at).to_not be(nil)
      expect(ingestion_batch.num_seconds_to_complete).to_not be(nil)
      expect(ingestion_batch.error_message).to be(nil)
    end

    it 'enqueues the user profiles from events events when user properties are present in the payload' do
      occurred_at = 10.minutes.ago
      fill_queue_with([
        { uuid: '1', swishjam_api_key: '123', occurred_at: occurred_at, name: 'some_random_event', properties: { foo: 'bar', user_id: 'my-user!' }.to_json },
        { uuid: '2', swishjam_api_key: '123', occurred_at: occurred_at, name: 'something_else', properties: { baz: 'boo' }.to_json },
        { uuid: '3', swishjam_api_key: '123', occurred_at: occurred_at, name: 'another_event!', properties: { bang: 'bong', user: { id: 'a-different-user!', email: 'jenny@swishjam.com', first_name: 'Jenny', last_name: 'Rosen', subscription_plan: 'Gold' }}.to_json },
      ])
      
      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).with(
        Ingestion::QueueManager::Queues.USER_PROFILES_FROM_EVENTS,
        [
          { 
            name: 'user_profile_from_event',
            occurred_at: occurred_at.round(3),
            properties: { id: 'my-user!' }.to_json,
            swishjam_api_key: '123',
            uuid: '1',
          },
          { 
            name: 'user_profile_from_event',
            occurred_at: occurred_at.round(3),
            properties: { id: 'a-different-user!', email: 'jenny@swishjam.com', first_name: 'Jenny', last_name: 'Rosen', subscription_plan: 'Gold' }.to_json,
            swishjam_api_key: '123',
            uuid: '3',
          }
        ]
      ).exactly(1).times

      ingestion_batch = Ingestion::EventsIngestion.ingest!
    end
  end
end