FactoryBot.define do
  factory :event_trigger_step_definition_for_single_step_trigger, class: EventTriggerStepDefinition.to_s do
    association :event_trigger_definition
    type { EventTriggerStepDefinitions::Slack::SendMessage.to_s }
    name { 'My Event Trigger Step' }
    description { 'Some event trigger step description' }
    config {{}}
  end

  factory :final_event_trigger_step_definition, class: EventTriggerStepDefinition.to_s do
    association :event_trigger_definition
    association :previous_event_trigger_step_definition
    type { EventTriggerStepDefinitions::Slack::SendMessage.to_s }
    name { 'My Event Trigger Step' }
    description { 'Some event trigger step description' }
    config {{}}
  end
end