require 'spec_helper'

describe EventTriggerSteps::ResendEmail do
  def expect_resend_api_request(api_key, request_body)
    expect(HTTParty).to receive(:post).with(
      'https://api.resend.com/emails',
      body: request_body.to_json,
      headers: { 'Authorization' => "Bearer #{api_key}" }
    ).exactly(1).times
  end

  def expect_no_resend_api_request(api_key, request_body)
    expect(HTTParty).not_to receive(:post).with(
      'https://api.resend.com/emails',
      body: request_body.to_json,
      headers: { 'Authorization' => "Bearer #{api_key}" }
    )
  end

  describe '#trigger!' do
    it 'triggers a Resend email when all conditions are met' do
      TriggeredEventTriggerStep.delete_all
      workspace = FactoryBot.create(:workspace)
      FactoryBot.create(:resend_destination, workspace: workspace, config: { api_key: 'a_resend_api_key!' })
      event_trigger = FactoryBot.create(:event_trigger, workspace: workspace, event_name: 'my_event_to_trigger_off_of')
      event_trigger_step = FactoryBot.create(:resend_email_event_trigger_step, 
        event_trigger: event_trigger, 
        config: {
          to: 'john@example.com',
          from: 'jenny@gmail.com',
          subject: 'Hello {user.name}!',
          body: "Hey {user.name},\nHow are you?Here's a link to our website: {event.website_link}",
          send_once_per_user: true,
          un_resolved_variable_safety_net: true,
        }
      )
      prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '1',
        swishjam_api_key: 'xyz',
        name: 'my_event_to_trigger_off_of',
        properties: { website_link: 'https://example.com' },
        user_properties: { name: 'John' },
        occurred_at: Time.current,
      )
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'john@example.com',
        subject: 'Hello John!',
        text: "Hey John,\nHow are you?Here's a link to our website: https://example.com",
      })
      result = event_trigger_step.trigger!(prepared_event)
      expect(result.class).to be(TriggeredEventTriggerStep)
      expect(TriggeredEventTriggerStep.count).to be(1)
    end

    it 'does not trigger a Resend email when the `send_once_per_user` config is set to true and this event_trigger has already sent an email to this address' do
      TriggeredEventTriggerStep.delete_all
      workspace = FactoryBot.create(:workspace)
      FactoryBot.create(:resend_destination, workspace: workspace, config: { api_key: 'a_resend_api_key!' })
      event_trigger = FactoryBot.create(:event_trigger, workspace: workspace, event_name: 'my_event_to_trigger_off_of')
      event_trigger_step = FactoryBot.create(:resend_email_event_trigger_step, 
        event_trigger: event_trigger, 
        config: {
          to: '{user.email}',
          from: 'jenny@gmail.com',
          subject: 'Hello {user.name}!',
          body: "Hey {user.name},\nHow are you?Here's a link to our website: {event.website_link}",
          send_once_per_user: true,
          un_resolved_variable_safety_net: true,
        }
      )
      prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '1',
        swishjam_api_key: 'xyz',
        name: 'my_event_to_trigger_off_of',
        properties: { website_link: 'https://example.com' },
        user_properties: { name: 'John', email: 'johnny@gmail.com' },
        occurred_at: Time.current,
      )
      second_prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '2',
        swishjam_api_key: 'xyz',
        name: 'my_event_to_trigger_off_of',
        properties: { website_link: 'https://a-different-link-example.com' },
        user_properties: { name: 'A different name?', email: 'johnny@gmail.com' },
        occurred_at: Time.current,
      )
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'johnny@gmail.com',
        subject: "Hello #{prepared_event.user_properties['name']}!",
        text: "Hey #{prepared_event.user_properties['name']},\nHow are you?Here's a link to our website: #{prepared_event.properties['website_link']}",
      })
      expect_no_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'johnny@gmail.com',
        subject: "Hello #{second_prepared_event.user_properties['name']}!",
        text: "Hey #{prepared_event.user_properties['name']},\nHow are you?Here's a link to our website: #{second_prepared_event.properties['website_link']}",
      })
      result = event_trigger_step.trigger!(prepared_event)
      second_result = event_trigger_step.trigger!(second_prepared_event)
      expect(result.class).to be(TriggeredEventTriggerStep)
      expect(second_result).to be(false)
      expect(TriggeredEventTriggerStep.count).to be(1)
    end

    it 'does trigger a Resend email when the `send_once_per_user` config is set to true and this event_trigger has only sent emails to different email addresses' do
      TriggeredEventTriggerStep.delete_all
      workspace = FactoryBot.create(:workspace)
      FactoryBot.create(:resend_destination, workspace: workspace, config: { api_key: 'a_resend_api_key!' })
      event_trigger = FactoryBot.create(:event_trigger, workspace: workspace, event_name: 'my_event_to_trigger_off_of')
      event_trigger_step = FactoryBot.create(:resend_email_event_trigger_step, 
        event_trigger: event_trigger, 
        config: {
          to: '{user.email}',
          from: 'jenny@gmail.com',
          subject: 'Hello {user.name}!',
          body: "Hey {user.name},\nHow are you?Here's a link to our website: {event.website_link}",
          send_once_per_user: true,
          un_resolved_variable_safety_net: true,
        }
      )
      prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '1',
        swishjam_api_key: 'xyz',
        name: 'my_event_to_trigger_off_of',
        properties: { website_link: 'https://example.com' },
        user_properties: { name: 'John', email: 'johnny@gmail.com' },
        occurred_at: Time.current,
      )
      second_prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '2',
        swishjam_api_key: 'xyz',
        name: 'my_event_to_trigger_off_of',
        properties: { website_link: 'https://a-different-link-example.com' },
        user_properties: { name: 'A different name?', email: 'johnny-2@gmail.com' },
        occurred_at: Time.current,
      )
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'johnny@gmail.com',
        subject: "Hello #{prepared_event.user_properties['name']}!",
        text: "Hey #{prepared_event.user_properties['name']},\nHow are you?Here's a link to our website: #{prepared_event.properties['website_link']}",
      })
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'johnny-2@gmail.com',
        subject: "Hello #{second_prepared_event.user_properties['name']}!",
        text: "Hey #{second_prepared_event.user_properties['name']},\nHow are you?Here's a link to our website: #{second_prepared_event.properties['website_link']}",
      })
      result = event_trigger_step.trigger!(prepared_event)
      second_result = event_trigger_step.trigger!(second_prepared_event)
      expect(result.class).to be(TriggeredEventTriggerStep)
      expect(second_result.class).to be(TriggeredEventTriggerStep)
      expect(TriggeredEventTriggerStep.count).to be(2)
    end

    it 'does trigger a Resend email when the `send_once_per_user` config is set to false and this event_trigger has already sent an email to this address' do
      TriggeredEventTriggerStep.delete_all
      workspace = FactoryBot.create(:workspace)
      FactoryBot.create(:resend_destination, workspace: workspace, config: { api_key: 'a_resend_api_key!' })
      event_trigger = FactoryBot.create(:event_trigger, workspace: workspace, event_name: 'my_event_to_trigger_off_of')
      event_trigger_step = FactoryBot.create(:resend_email_event_trigger_step, 
        event_trigger: event_trigger, 
        config: {
          to: '{user.email}',
          from: 'jenny@gmail.com',
          subject: 'Hello {user.name}!',
          body: "Hey {user.name},\nHow are you?Here's a link to our website: {event.website_link}",
          send_once_per_user: false,
          un_resolved_variable_safety_net: true,
        }
      )
      prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '1',
        swishjam_api_key: 'xyz',
        name: 'my_event_to_trigger_off_of',
        properties: { website_link: 'https://example.com' },
        user_properties: { name: 'John', email: 'johnny@gmail.com' },
        occurred_at: Time.current,
      )
      second_prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '2',
        swishjam_api_key: 'xyz',
        name: 'my_event_to_trigger_off_of',
        properties: { website_link: 'https://a-different-link-example.com' },
        user_properties: { name: 'A different name?', email: 'johnny@gmail.com' },
        occurred_at: Time.current,
      )
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'johnny@gmail.com',
        subject: "Hello #{prepared_event.user_properties['name']}!",
        text: "Hey #{prepared_event.user_properties['name']},\nHow are you?Here's a link to our website: #{prepared_event.properties['website_link']}",
      })
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'johnny@gmail.com',
        subject: "Hello #{second_prepared_event.user_properties['name']}!",
        text: "Hey #{second_prepared_event.user_properties['name']},\nHow are you?Here's a link to our website: #{second_prepared_event.properties['website_link']}",
      })
      result = event_trigger_step.trigger!(prepared_event)
      second_result = event_trigger_step.trigger!(second_prepared_event)
      expect(result.class).to be(TriggeredEventTriggerStep)
      expect(second_result.class).to be(TriggeredEventTriggerStep)
      expect(TriggeredEventTriggerStep.count).to be(2)
    end

    it 'does not trigger a Resend email when the `un_resolved_variable_safety_net` config is set to true and there are un resolved variables in the Resend request payload' do
      TriggeredEventTriggerStep.delete_all
      workspace = FactoryBot.create(:workspace)
      FactoryBot.create(:resend_destination, workspace: workspace, config: { api_key: 'a_resend_api_key!' })
      event_trigger = FactoryBot.create(:event_trigger, workspace: workspace, event_name: 'my_event_to_trigger_off_of')
      event_trigger_step = FactoryBot.create(:resend_email_event_trigger_step, 
        event_trigger: event_trigger, 
        config: {
          to: '{user.email}',
          from: 'jenny@gmail.com',
          subject: 'Hello {user.name}!',
          body: "Hey {user.name},\nHow are you?Here's a link to our website: {event.website_link}",
          send_once_per_user: true,
          un_resolved_variable_safety_net: true,
        }
      )
      prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '1',
        swishjam_api_key: 'xyz',
        name: 'my_event_to_trigger_off_of',
        properties: { website_link: nil },
        user_properties: { name: 'John', email: 'johnny@gmail.com' },
        occurred_at: Time.current,
      )
      expect(HTTParty).not_to receive(:post)
      expect(event_trigger_step).to receive(:send_un_resolved_variables_notification).with(prepared_event, {
        from: 'jenny@gmail.com',
        to: 'johnny@gmail.com',
        subject: 'Hello John!',
        text: "Hey John,\nHow are you?Here's a link to our website: {event.website_link}",
      }).exactly(1).times

      result = event_trigger_step.trigger!(prepared_event)
      expect(result).to be(false)
      expect(TriggeredEventTriggerStep.count).to be(0)
    end

    it 'does trigger a Resend email when the `un_resolved_variable_safety_net` config is set to true and there are un resolved variables in the Resend request payload' do
      TriggeredEventTriggerStep.delete_all
      workspace = FactoryBot.create(:workspace)
      FactoryBot.create(:resend_destination, workspace: workspace, config: { api_key: 'a_resend_api_key!' })
      event_trigger = FactoryBot.create(:event_trigger, workspace: workspace, event_name: 'my_event_to_trigger_off_of')
      event_trigger_step = FactoryBot.create(:resend_email_event_trigger_step, 
        event_trigger: event_trigger, 
        config: {
          to: '{user.email}',
          from: 'jenny@gmail.com',
          subject: 'Hello {user.name}!',
          body: "Hey {user.name},\nHow are you?Here's a link to our website: {event.website_link}",
          send_once_per_user: true,
          un_resolved_variable_safety_net: false,
        }
      )
      prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '1',
        swishjam_api_key: 'xyz',
        name: 'my_event_to_trigger_off_of',
        properties: { website_link: nil },
        user_properties: { name: 'John', email: 'johnny@gmail.com' },
        occurred_at: Time.current,
      )
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'johnny@gmail.com',
        subject: 'Hello John!',
        text: "Hey John,\nHow are you?Here's a link to our website: {event.website_link}",
      }).exactly(1).times

      result = event_trigger_step.trigger!(prepared_event)
      expect(result.class).to be(TriggeredEventTriggerStep)
      expect(TriggeredEventTriggerStep.count).to be(1)
    end

    it 'includes the `cc` and `bcc` fields in the Resend request payload when they are present in the config' do
      TriggeredEventTriggerStep.delete_all
      workspace = FactoryBot.create(:workspace)
      FactoryBot.create(:resend_destination, workspace: workspace, config: { api_key: 'a_resend_api_key!' })
      event_trigger = FactoryBot.create(:event_trigger, workspace: workspace, event_name: 'my_event_to_trigger_off_of')
      event_trigger_step = FactoryBot.create(:resend_email_event_trigger_step, 
        event_trigger: event_trigger, 
        config: {
          to: 'john@example.com',
          from: 'jenny@gmail.com',
          subject: 'Hello {user.name}!',
          body: "Hey {user.name},\nHow are you?Here's a link to our website: {event.website_link}",
          cc: 'circle-back@gmail.com',
          bcc: 'secret-sally@gmail.com',
          send_once_per_user: true,
          un_resolved_variable_safety_net: true,
        }
      )
      prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '1',
        swishjam_api_key: 'xyz',
        name: 'my_event_to_trigger_off_of',
        properties: { website_link: 'https://example.com' },
        user_properties: { name: 'John' },
        occurred_at: Time.current,
      )
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'john@example.com',
        subject: 'Hello John!',
        text: "Hey John,\nHow are you?Here's a link to our website: https://example.com",
        cc: 'circle-back@gmail.com',
        bcc: 'secret-sally@gmail.com',
      })
      result = event_trigger_step.trigger!(prepared_event)
      expect(result.class).to be(TriggeredEventTriggerStep)
      expect(TriggeredEventTriggerStep.count).to be(1)
    end
  end
end