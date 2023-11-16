require 'spec_helper'

describe EventTriggers::Evaluator do
  describe '#evaluate_ingested_events' do
    it 'finds all matching event triggers for the ingested events and enqueues a job to trigger them' do
      workspace = FactoryBot.create(:workspace)
      event_trigger = FactoryBot.create(:event_trigger, workspace: workspace, event_name: 'trigger!')
      FactoryBot.create(:event_trigger_step, event_trigger: event_trigger)

      formatted_json_events = [{ 'name' => 'trigger!', 'swishjam_api_key' => workspace.api_keys.first.public_key }]
      expect(TriggerEventTriggersInBatchesJob).to receive(:perform_async).with([{ event: formatted_json_events[0], trigger_id: event_trigger.id }])
      
      EventTriggers::Evaluator.evaluate_ingested_events(formatted_json_events)
    end

    it 'should ignore Design Patterns events that are not relevant' do
      design_patterns_public_key = 'swishjam_prdct-c094a41f338335c4'
      workspace = FactoryBot.create(:workspace)
      workspace.api_keys.last.update_column :public_key, design_patterns_public_key

      event_trigger = FactoryBot.create(:event_trigger, workspace: workspace, event_name: 'presented_with_your_subscription')
      FactoryBot.create(:event_trigger_step, event_trigger: event_trigger)

      formatted_json_events = [
        { 'name' => 'presented_with_your_subscription', 'swishjam_api_key' => design_patterns_public_key, 'properties' => { 'userEmail' => 'collin@gmail.com' }},
        { 'name' => 'presented_with_your_subscription', 'swishjam_api_key' => design_patterns_public_key, 'properties' => { 'userEmail' => 'collin@hello.ru' }},
        { 'name' => 'presented_with_your_subscription', 'swishjam_api_key' => design_patterns_public_key, 'properties' => { 'userEmail' => 'collin@swishjam.com' }},
      ]
      expect(TriggerEventTriggersInBatchesJob).to receive(:perform_async).with([
        { 
          event: { 'name' => 'presented_with_your_subscription', 'swishjam_api_key' => design_patterns_public_key, 'properties' => { 'userEmail' => 'collin@swishjam.com' }}, 
          trigger_id: event_trigger.id 
        }
      ])
      
      EventTriggers::Evaluator.evaluate_ingested_events(formatted_json_events)
    end
  end
end