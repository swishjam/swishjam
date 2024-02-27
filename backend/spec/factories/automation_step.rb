FactoryBot.define do
  factory :automation_step do
    association :automation
    sequence_index { 0 }
    config { {} }
  end

  factory :slack_message_automation_step, parent: :automation_step do
    type { AutomationSteps::SlackMessage.to_s }
    config {{ channel_id: 'stub!', channel_name: 'Some slack channel', message_header: 'hello world!', message_body: 'This is a test message' }}
  end

  factory :resend_email_automation_step, parent: :automation_step do
    type { AutomationSteps::ResendEmail.to_s }
    config {{ from: 'jenny@swishjam.com', to: 'stub!@gmail.com', subject: 'Some email subject', body: 'This is a test email' }}
  end

  factory :delay_automation_step, parent: :automation_step do
    type { AutomationSteps::Delay.to_s }
    config {{ delay_amount: 5, delay_unit: 'minutes' }}
  end
end