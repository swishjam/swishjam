require 'spec_helper'

describe Automations::ResendEmailExecutor do
  let(:workspace) { FactoryBot.create(:workspace) }
  let(:automation) { FactoryBot.create(:automation, workspace: workspace) }
  let(:analytics_user_profile) { FactoryBot.create(:analytics_user_profile, workspace: workspace) }
  let(:slack_destination) { FactoryBot.create(:slack_destination, workspace: workspace) }
  
  let(:slack_message_automation_step) { FactoryBot.create(:slack_message_automation_step, automation: automation) }
  let(:resend_email_automation_step) { FactoryBot.create(:resend_email_automation_step, automation: automation) }

  let(:slack_to_resend_next_automation_step_condition) { FactoryBot.create(:next_automation_step_condition, automation_step: slack_message_automation_step, next_automation_step: resend_email_automation_step) }
  let(:slack_to_resend_next_automation_step_condition_rule) { FactoryBot.create(:event_property_equals_next_automation_step_condition_rule, next_automation_step_condition: slack_to_resend_next_automation_step_condition) }
  
  let(:prepared_event) do
    Ingestion::ParsedEventFromIngestion.new(
      uuid: '1',
      occurred_at: Time.current,
      swishjam_api_key: workspace.api_keys.first.public_key,
      properties: { an_event_key: 'an_event_value' },
      user_profile_id: analytics_user_profile.id,
      user_properties: { email: analytics_user_profile.email },
    )
  end
end