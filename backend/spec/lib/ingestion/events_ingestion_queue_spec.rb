require 'spec_helper'

RSpec.describe Ingestion::EventsIngestion do
  def fill_queue_with(events)
    allow(Ingestion::QueueManager).to receive(:pop_all_records_from_queue).and_return(events.map{ |e| e.to_json })
  end

  describe '#ingest!' do
    it 'writes the events in the queue to ClickHouse' do
      occurred_at = 10.minutes.ago
      fill_queue_with([{ uuid: '123', swishjam_api_key: 'stub', name: 'foo', occurred_at: occurred_at, properties: { foo: 'bar' }  }])

      expect(IngestionBatch.all.count).to be(0)
      expect(Analytics::Event.all.count).to be(0)
      
      Ingestion::EventsIngestion.new.ingest!

      expect(Analytics::Event.all.count).to be(1)
      expect(Analytics::Event.first.occurred_at.floor).to eq(occurred_at.floor)
      expect(Analytics::Event.first.swishjam_api_key).to eq('stub')
      expect(Analytics::Event.first.name).to eq('foo')
      expect(Analytics::Event.first.properties['foo']).to eq('bar')
      
      expect(IngestionBatch.all.count).to be(1)
      expect(IngestionBatch.first.num_records).to be(1)
      expect(IngestionBatch.first.completed_at).to_not be(nil)
      expect(IngestionBatch.first.num_seconds_to_complete).to_not be(nil)
      expect(IngestionBatch.first.error_message).to be(nil)
    end

    it 'enqueues the user identify and organization identify events' do
      occurred_at = 10.minutes.ago
      fill_queue_with([
        { uuid: '123', swishjam_api_key: 'stub', name: 'foo', occurred_at: occurred_at, properties: { foo: 'bar' }  },
        { uuid: '456', swishjam_api_key: 'stub', name: 'identify', occurred_at: occurred_at, properties: { user_unique_identifier: 'unique!', email: 'john@gmail.com' }},
      ])

      expect(IngestionBatch.all.count).to be(0)
      expect(Analytics::Event.all.count).to be(0)

      allow(Ingestion::QueueManager).to receive(:push_records_into_queue).with(
        Ingestion::QueueManager::Queues.IDENTIFY, 
        [{ uuid: '456', swishjam_api_key: 'stub', name: 'identify', occurred_at: occurred_at, properties: { user_unique_identifier: 'unique!', email: 'john@gmail.com' }}]
      ).exactly(1).times
      
      ingestion_batch = Ingestion::EventsIngestion.new.ingest!

      events = Analytics::Event.all
      expect(events.count).to be(2)
      expect(events.collect(&:name).include?('foo')).to be(true)
      expect(events.collect(&:name).include?('identify')).to be(true)
      
      expect(ingestion_batch.num_records).to be(2)
      expect(ingestion_batch.completed_at).to_not be(nil)
      expect(ingestion_batch.num_seconds_to_complete).to_not be(nil)
      expect(ingestion_batch.error_message).to be(nil)
    end
  end
end