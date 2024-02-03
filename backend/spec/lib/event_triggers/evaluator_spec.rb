require 'spec_helper'

describe EventTriggers::Evaluator do
  describe '#evaluate_ingested_events' do
    it 'finds all matching event triggers for the ingested event and enqueues a job to trigger them' do
      workspace = FactoryBot.create(:workspace)
      event_trigger = FactoryBot.create(:event_trigger, workspace: workspace, event_name: 'trigger!')
      FactoryBot.create(:event_trigger_step, event_trigger: event_trigger)

      prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '1',
        name: event_trigger.event_name,
        swishjam_api_key: workspace.api_keys.first.public_key,
        occurred_at: Time.current,
        properties: { a_key: 'a value!' }
      )
      dont_trigger_prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '2',
        name: 'dont_trigger!',
        swishjam_api_key: workspace.api_keys.first.public_key,
        occurred_at: Time.current,
        properties: { a_key: 'a value!' }
      )
      same_event_name_different_api_key = Ingestion::ParsedEventFromIngestion.new(
        uuid: '3',
        name: event_trigger.event_name,
        swishjam_api_key: 'a different key!!!',
        occurred_at: Time.current,
        properties: { a_key: 'a value!' }
      )
      expect(IngestionJobs::TriggerEventTrigger).to receive(:perform_async).with(event_trigger.id, prepared_event.as_json).exactly(1).times
      
      evaluator = EventTriggers::Evaluator.new
      evaluator.enqueue_event_trigger_jobs_that_match_event(prepared_event)
      evaluator.enqueue_event_trigger_jobs_that_match_event(dont_trigger_prepared_event)
      evaluator.enqueue_event_trigger_jobs_that_match_event(same_event_name_different_api_key)
    end
  end
end