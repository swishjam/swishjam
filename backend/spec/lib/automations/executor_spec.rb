require 'spec_helper'

describe Automations::Executor do
  let(:workspace) { FactoryBot.create(:workspace) }
  let(:automation) { FactoryBot.create(:automation, workspace: workspace) }
  let(:analytics_user_profile) { FactoryBot.create(:analytics_user_profile, workspace: workspace) }
  let(:slack_destination) { FactoryBot.create(:slack_destination, workspace: workspace) }
  
  let(:slack_message_automation_step) { FactoryBot.create(:slack_message_automation_step, automation: automation, sequence_index: 0) }
  let(:resend_email_automation_step) { FactoryBot.create(:resend_email_automation_step, automation: automation, sequence_index: 1) }

  let(:slack_to_resend_next_automation_step_condition) { FactoryBot.create(:next_automation_step_condition, automation_step: slack_message_automation_step, next_automation_step: resend_email_automation_step) }
  let(:slack_to_resend_next_automation_step_condition_rule) { FactoryBot.create(:event_property_equals_next_automation_step_condition_rule, next_automation_step_condition: slack_to_resend_next_automation_step_condition) }
  
  let(:prepared_event) do
    Ingestion::ParsedEventFromIngestion.new(
      uuid: '1',
      occurred_at: Time.current,
      swishjam_api_key: workspace.api_keys.first.public_key,
      name: automation.entry_point_event_name,
      properties: { an_event_key: 'an_event_value' },
      user_profile_id: analytics_user_profile.id,
      user_properties: { email: analytics_user_profile.email },
    )
  end
  let(:executor) { described_class.new(automation: automation, prepared_event: prepared_event) }

  before do
    # these won't exist in the DB until we call the methods below?
    slack_to_resend_next_automation_step_condition
    slack_destination
  end

  describe '#execute_automation!' do
    it 'creates an `executed_automation` record' do
      expect(automation.executed_automations.count).to eq(0)
      
      executed_automation = executor.execute_automation!

      expect(automation.executed_automations.count).to eq(1)
      expect(executed_automation.started_at).to be_present
      expect(executed_automation.executed_on_user_profile_id).to eq(analytics_user_profile.id)
      expect(executed_automation.event_json['uuid']).to eq(prepared_event.uuid)
      expect(executed_automation.event_json['properties']).to eq(prepared_event.properties)
      expect(executed_automation.event_json['name']).to eq(prepared_event.event_name)
      expect(executed_automation.event_uuid).to eq(prepared_event.uuid)
      expect(executed_automation.seconds_from_occurred_at_to_executed).to be_present
      expect(executed_automation.completed_at).to be_present
    end

    it 'creates three `executed_automation_step` records for each automation step that was executed' do
      expect(automation.executed_automation_steps.count).to eq(0)

      executor.execute_automation!

      expect(automation.executed_automation_steps.count).to eq(2)
      expect(slack_message_automation_step.executed_automation_steps.count).to eq(1)
      expect(resend_email_automation_step.executed_automation_steps.count).to eq(1)

      slack_execution = slack_message_automation_step.executed_automation_steps.first
      expect(slack_execution.started_at).to be_present
      expect(slack_execution.completed_at).to be_present
      expect(slack_execution.error_message).to be_nil

      resend_email_execution = resend_email_automation_step.executed_automation_steps.first
      expect(resend_email_execution.started_at).to be_present
      expect(resend_email_execution.completed_at).to be_present
      expect(resend_email_execution.error_message).to be_nil
    end

    it 'does not complete the automation or execute the next automation step when the executed_automation_step is not completed after being executed' do
      expect_any_instance_of(AutomationSteps::SlackMessage).to receive(:execute!).with(prepared_event, anything, executed_automation_step: nil, as_test: false).exactly(1).times.and_call_original
      expect_any_instance_of(AutomationSteps::SlackMessage).to receive(:execute_automation!).with(prepared_event, anything, as_test: false).exactly(1).times.and_return(nil)
      expect_any_instance_of(AutomationSteps::ResendEmail).to_not receive(:execute!)
      expect_any_instance_of(AutomationSteps::ResendEmail).to_not receive(:execute_automation!)

      executor.execute_automation!

      expect(automation.executed_automation_steps.count).to eq(1)
      
      slack_execution = slack_message_automation_step.executed_automation_steps.first
      expect(slack_execution.started_at).to be_present
      expect(slack_execution.completed_at).to be_nil
      expect(slack_execution.error_message).to be_nil
    end

    it 'completes the automation and does not execute any more automation steps when the automation step that was executed has no `next_automation_step_conditions` that satisfy the event' do
      expect(executor).to receive(:satisfied_next_automation_step_conditions).with(anything, prepared_event).and_return([])

      automation_execution = executor.execute_automation!

      expect(automation.executed_automation_steps.count).to be(1)
      
      slack_execution = slack_message_automation_step.executed_automation_steps.first
      expect(slack_execution.started_at).to be_present
      expect(slack_execution.completed_at).to be_present
      expect(slack_execution.error_message).to be_nil

      expect(automation_execution.completed_at).to be_present
    end

    it 'creates a `satisfied_next_automation_step_condition` record for each `next_automation_step_condition` that is satisfied by the event' do
      expect(SatisfiedNextAutomationStepCondition.count).to eq(0)

      executed_automation = executor.execute_automation!

      expect(SatisfiedNextAutomationStepCondition.count).to eq(1)
      expect(slack_to_resend_next_automation_step_condition.satisfied_next_automation_step_conditions.count).to eq(1)
      expect(slack_message_automation_step.executed_automation_steps.count).to eq(1)
      slack_execution = slack_message_automation_step.executed_automation_steps.first
      expect(slack_execution.satisfied_next_automation_step_conditions.count).to eq(1)
    end
  end

  describe '#pick_back_up_automation_from_executed_automation_step!' do
    it 'uses the provided executed_automation_step and does not create a new one to continue the automation execution' do
      executed_automation_step = ExecutedAutomationStep.create!(
        started_at: 5.minutes.ago, 
        executed_automation: executor.executed_automation, 
        automation_step: resend_email_automation_step,
      )

      expect_any_instance_of(AutomationSteps::SlackMessage).to_not receive(:execute!)
      expect_any_instance_of(AutomationSteps::SlackMessage).to_not receive(:execute_automation!)
      expect_any_instance_of(AutomationSteps::ResendEmail).to receive(:execute!).with(
        prepared_event, 
        executor.executed_automation, 
        executed_automation_step: executed_automation_step,
        as_test: false,
      ).exactly(1).times.and_call_original
      expect_any_instance_of(AutomationSteps::ResendEmail).to receive(:execute_automation!).with(prepared_event, executed_automation_step, as_test: false).exactly(1).times.and_return(nil)

      executor.pick_back_up_automation_from_executed_automation_step!(executed_automation_step)
    end
  end
end