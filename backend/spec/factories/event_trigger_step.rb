FactoryBot.define do
  factory :event_trigger_step do
    association :event_trigger
    type { 'EventTriggerSteps::Slack' }
    config {{ stubbed: true }}
  end

  factory :resend_email_event_trigger_step, class: EventTriggerSteps::ResendEmail.to_s do
    association :event_trigger
    config {{
      to: 'foo@example.com',
      from: 'jenny@gmail.com',
      subject: 'Hello {user.name}!',
      body: "Hello world!",
    }}
  end
end