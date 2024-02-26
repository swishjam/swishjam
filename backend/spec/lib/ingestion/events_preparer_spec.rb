require 'spec_helper'

describe Ingestion::EventsPreparer do
  describe '#prepare_events!' do
    let(:raw_events_to_prepare) { 
      [
        Ingestion::EventsPreparer.format_for_events_to_prepare_queue(
          uuid: '123',
          swishjam_api_key: 'xyz',
          name: 'some_event_name',
          occurred_at: Time.current,
          properties: { 'key' => 'value' }
        )  
      ] 
    }

    it 'pushes successfully prepared records into the prepared events queue' do
      stubbed_prepared_event = Ingestion::ParsedEventFromIngestion.new(raw_events_to_prepare[0])
      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).with(
        Ingestion::QueueManager::Queues.PREPARED_EVENTS, 
        [
          hash_including(
            uuid: stubbed_prepared_event.uuid,
            swishjam_api_key: stubbed_prepared_event.swishjam_api_key,
            name: stubbed_prepared_event.name,
            properties: stubbed_prepared_event.sanitized_properties.to_json,
            user_profile_id: stubbed_prepared_event.user_profile_id,
            user_properties: stubbed_prepared_event.user_properties.to_json,
            organization_profile_id: stubbed_prepared_event.organization_profile_id,
            organization_properties: stubbed_prepared_event.organization_properties.to_json,
            occurred_at: anything,
            ingested_at: anything,
          )
        ]
      )
      expect_any_instance_of(Ingestion::EventPreparers::BasicEventHandler).to receive(:handle_and_return_prepared_events!).and_return([stubbed_prepared_event])

      described_class.new(raw_events_to_prepare).prepare_events!
    end

    it 'pushes failed records into the events to prepare DLQ' do
      expect(Ingestion::QueueManager).to_not receive(:push_records_into_queue).with(Ingestion::QueueManager::Queues.PREPARED_EVENTS, anything)
      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).with(
        Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE_DLQ, 
        [raw_events_to_prepare[0].merge('dlq_data' => { error_message: 'An error message!', errored_at: anything })]
      )
      expect_any_instance_of(Ingestion::EventPreparers::BasicEventHandler).to receive(:handle_and_return_prepared_events!).and_raise(StandardError, 'An error message!')

      described_class.new(raw_events_to_prepare).prepare_events!
    end

    it 'uses the ingestion batch if provided' do
      ingestion_batch = IngestionBatch.start!('event_preparer', num_records: raw_events_to_prepare.count)
      described_class.new(raw_events_to_prepare, ingestion_batch: ingestion_batch).prepare_events!
      expect(ingestion_batch.completed_at).to_not be_nil
      expect(ingestion_batch.num_seconds_to_complete).to_not be_nil
      expect(ingestion_batch.num_successful_records).to eq(1)
      expect(ingestion_batch.num_failed_records).to eq(0)
    end

    it 'creates a new ingestion batch if not provided' do
      expect(IngestionBatch).to receive(:start!).with('event_preparer', num_records: raw_events_to_prepare.count).and_call_original
      expect(IngestionBatch.count).to eq(0)
      described_class.new(raw_events_to_prepare).prepare_events!
      expect(IngestionBatch.count).to eq(1)
      expect(IngestionBatch.first.num_successful_records).to eq(1)
      expect(IngestionBatch.first.num_failed_records).to eq(0)
      expect(IngestionBatch.first.num_seconds_to_complete).to_not be_nil
      expect(IngestionBatch.first.completed_at).to_not be_nil
    end

    it 'calls the `EventTriggers::Evaluator.enqueue_event_trigger_jobs_that_match_event` for each illegible prepared event' do
      stubbed_prepared_event = Ingestion::ParsedEventFromIngestion.new(raw_events_to_prepare[0])
      expect_any_instance_of(Ingestion::EventPreparers::BasicEventHandler).to receive(:handle_and_return_prepared_events!).and_return([stubbed_prepared_event])
      expect_any_instance_of(EventTriggers::Evaluator).to receive(:enqueue_event_trigger_jobs_that_match_event).with(stubbed_prepared_event).once
      described_class.new(raw_events_to_prepare).prepare_events!
    end

    it 'does not call the `EventTriggers::Evaluator.enqueue_event_trigger_jobs_that_match_event` for prepared events that are inelligble to receive event triggers' do
      raw_events_to_prepare[0]['name'] = '*update_user'
      stubbed_prepared_event = Ingestion::ParsedEventFromIngestion.new(raw_events_to_prepare[0])
      expect_any_instance_of(Ingestion::EventPreparers::BasicEventHandler).to receive(:handle_and_return_prepared_events!).and_return([stubbed_prepared_event])
      expect_any_instance_of(EventTriggers::Evaluator).to_not receive(:enqueue_event_trigger_jobs_that_match_event)
      described_class.new(raw_events_to_prepare).prepare_events!
    end

    it 'does not enqueue prepared events that are inelligible to be written to the events table' do
      raw_events_to_prepare[0]['name'] = '*update_user'
      expect(Ingestion::QueueManager).to_not receive(:push_records_into_queue)
      expect_any_instance_of(Ingestion::EventPreparers::BasicEventHandler).to receive(:handle_and_return_prepared_events!).exactly(1).times.and_call_original
      described_class.new(raw_events_to_prepare).prepare_events!
    end

    it 'uses the correct event preparer class for the event' do
      raw_events_to_prepare[0]['name'] = 'identify'
      expect_any_instance_of(Ingestion::EventPreparers::UserIdentifyHandler).to receive(:handle_and_return_prepared_events!).and_call_original
      described_class.new(raw_events_to_prepare).prepare_events!

      raw_events_to_prepare[0]['name'] = 'some_other_event'
      expect_any_instance_of(Ingestion::EventPreparers::BasicEventHandler).to receive(:handle_and_return_prepared_events!).and_call_original
      described_class.new(raw_events_to_prepare).prepare_events!

      raw_events_to_prepare[0]['name'] = 'stripe.some_event'
      expect_any_instance_of(Ingestion::EventPreparers::StripeEventHandler).to receive(:handle_and_return_prepared_events!).and_call_original
      described_class.new(raw_events_to_prepare).prepare_events!

      raw_events_to_prepare[0]['name'] = 'github.some_event'
      expect_any_instance_of(Ingestion::EventPreparers::GithubEventHandler).to receive(:handle_and_return_prepared_events!).and_call_original
      described_class.new(raw_events_to_prepare).prepare_events!

      raw_events_to_prepare[0]['name'] = 'cal.some_event'
      expect_any_instance_of(Ingestion::EventPreparers::CalComEventHandler).to receive(:handle_and_return_prepared_events!).and_call_original
      described_class.new(raw_events_to_prepare).prepare_events!

      raw_events_to_prepare[0]['name'] = 'intercom.some_event'
      expect_any_instance_of(Ingestion::EventPreparers::IntercomEventHandler).to receive(:handle_and_return_prepared_events!).and_call_original
      described_class.new(raw_events_to_prepare).prepare_events!
    end
  end
end