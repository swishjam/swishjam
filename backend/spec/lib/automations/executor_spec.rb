require 'spec_helper'

describe Automations::Executor do
  let(:workspace) { FactoryBot.create(:workspace) }
  let(:automation) { FactoryBot.create(:automation) }
  let(:analytics_user_profile) { FactoryBot.create(:analytics_user_profile, workspace: workspace) }
  
  let(:slack_message_automation_step) { FactoryBot.create(:slack_message_automation_step, automation: automation, sequence_index: 0) }
  let(:delay_automation_step) { FactoryBot.create(:delay_automation_step, automation: automation, sequence_index: 1) }
  let(:resend_email_automation_step) { FactoryBot.create(:resend_email_automation_step, automation: automation, sequence_index: 2) }

  let(:slack_to_delay_next_automation_step_condition) { FactoryBot.create(:always_true_next_automation_step_condition, automation_step: slack_message_automation_step, next_automation_step: delay_automation_step) }
  let(:delay_to_resend_email_next_automation_step_condition) { FactoryBot.create(:always_true_next_automation_step_condition, automation_step: delay_automation_step, next_automation_step: resend_email_automation_step) }
  
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
  let(:executor) { described_class.new(automation, prepared_event) }

  before do
    # these won't exist in the DB until we call the methods below?
    slack_to_delay_next_automation_step_condition
    delay_to_resend_email_next_automation_step_condition
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

      expect(automation.executed_automation_steps.count).to eq(3)
      expect(slack_message_automation_step.executed_automation_steps.count).to eq(1)
      expect(delay_automation_step.executed_automation_steps.count).to eq(1)
      expect(resend_email_automation_step.executed_automation_steps.count).to eq(1)

      slack_execution = slack_message_automation_step.executed_automation_steps.first
      expect(slack_execution.started_at).to be_present
      expect(slack_execution.completed_at).to be_present
      expect(slack_execution.error_message).to be_nil

      delay_execution = delay_automation_step.executed_automation_steps.first
      expect(delay_execution.started_at).to be_present
      expect(delay_execution.completed_at).to be_present
      expect(delay_execution.error_message).to be_nil

      resend_email_execution = resend_email_automation_step.executed_automation_steps.first
      expect(resend_email_execution.started_at).to be_present
      expect(resend_email_execution.completed_at).to be_present
      expect(resend_email_execution.error_message).to be_nil
    end

    it 'does not complete the automation or execute the next automation step when the executed_automation_step is not completed after being executed' do
      expect_any_instance_of(AutomationSteps::SlackMessage).to receive(:execute_automation!).with(prepared_event, anything).exactly(1).times.and_call_original
      expect_any_instance_of(AutomationSteps::Delay).to receive(:execute_automation!).with(prepared_event, anything).exactly(1).times.and_return(nil)
      expect_any_instance_of(AutomationSteps::ResendEmail).to_not receive(:execute_automation!)

      executor.execute_automation!

      expect(automation.executed_automation_steps.count).to eq(2)
      
      slack_execution = slack_message_automation_step.executed_automation_steps.first
      expect(slack_execution.started_at).to be_present
      expect(slack_execution.completed_at).to be_present
      expect(slack_execution.error_message).to be_nil

      delay_execution = delay_automation_step.executed_automation_steps.first
      expect(delay_execution.started_at).to be_present
      expect(delay_execution.completed_at).to be_nil
      expect(delay_execution.error_message).to be_nil
    end

    it ''
  end
end