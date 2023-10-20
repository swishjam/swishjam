require 'spec_helper'

RSpec.describe EventTriggers::Evaluator, disable_clickhouse_migrations: true do
  describe '#evaluate!' do
    it 'evaluates and triggers all the event_triggers against the events in the payload that match' do
      user = FactoryBot.create(:user)
      workspace = FactoryBot.create(:workspace)
      event_trigger_definition = FactoryBot.create(:event_trigger_definition, event_name: 'TRIGGER!', workspace: workspace, created_by_user: user)
      event_trigger_step_definition_1 = FactoryBot.create(:event_trigger_step_definition_for_single_step_trigger, event_trigger_definition: event_trigger_definition)
      event_trigger_step_definition_2 = FactoryBot.create(:event_trigger_step_definition)
      expect(event_trigger_definition.event_trigger_executions.count).to be(0)
      expect(event_trigger_step_definition.event_trigger_step_executions.count).to be(0)

      EventTriggers::Evaluator.new(workspace.api_keys.first.public_key, [{ 'name' => 'TRIGGER!' }]).evaluate_triggers!

      expect(event_trigger_definition.event_trigger_executions.count).to be(1)
      expect(event_trigger_step_definition.event_trigger_step_executions.count).to be(1)
    end
  end
end