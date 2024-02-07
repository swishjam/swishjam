require 'spec_helper'

describe EventTriggers::ResendEmailInvoker do
  def expect_resend_api_request(api_key, request_body)
    expect(HTTParty).to receive(:post).with(
      'https://api.resend.com/emails',
      # body: request_body.to_json,
      body: request_body,
      headers: { 'Authorization' => "Bearer #{api_key}" }
    ).exactly(1).times.and_return(double(code: 200, as_json: { 'id' => 'some-resend-email-id' }))
  end

  def expect_no_resend_api_request(api_key, request_body)
    expect(HTTParty).not_to receive(:post).with(
      'https://api.resend.com/emails',
      # body: request_body.to_json,
      body: request_body,
      headers: { 'Authorization' => "Bearer #{api_key}" }
    )
  end

  describe '#invoke_or_schedule_email_delivery_if_necessary!' do
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
      
      result = EventTriggers::ResendEmailInvoker.new(event_trigger_step, prepared_event).invoke_or_schedule_email_delivery_if_necessary
      
      expect(TriggeredEventTriggerStep.count).to be(1)
      expect(result.class).to be(TriggeredEventTriggerStep)
      expect(result.completed?).to be(true)
      expect(result.failed?).to be(false)
      expect(result.started_at).to_not be(nil)
            expect(result.triggered_event_json['uuid']).to eq(prepared_event.uuid)
      expect(result.triggered_event_json['swishjam_api_key']).to eq(prepared_event.swishjam_api_key)
      expect(result.triggered_event_json['name']).to eq(prepared_event.name)
      expect(result.triggered_event_json['user_profile_id']).to eq(prepared_event.user_profile_id)
      expect(result.triggered_event_json['organization_profile_id']).to eq(prepared_event.organization_profile_id)
      expect(result.triggered_event_json['properties']).to eq(prepared_event.properties)
      expect(result.triggered_event_json['user_properties']).to eq(prepared_event.user_properties)
      expect(result.triggered_event_json['organization_properties']).to eq(prepared_event.organization_properties)
      expect(result.triggered_event_json['occurred_at'].to_time.round(2)).to eq(prepared_event.occurred_at.to_time.round(2))
      expect(result.triggered_payload).to eq({ 
        'resend_request_body' => {
          'from' => 'jenny@gmail.com',
          'to' => 'john@example.com',
          'subject' => 'Hello John!',
          'text' => "Hey John,\nHow are you?Here's a link to our website: https://example.com",
        },
        'resend_response' => { 'id' => 'some-resend-email-id' },
      })
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
        text: "Hey #{second_prepared_event.user_properties['name']},\nHow are you?Here's a link to our website: #{second_prepared_event.properties['website_link']}",
      })
      
      result = EventTriggers::ResendEmailInvoker.new(event_trigger_step, prepared_event).invoke_or_schedule_email_delivery_if_necessary
      second_result = EventTriggers::ResendEmailInvoker.new(event_trigger_step, second_prepared_event).invoke_or_schedule_email_delivery_if_necessary
      
      expect(TriggeredEventTriggerStep.count).to be(1)
      expect(result.class).to be(TriggeredEventTriggerStep)
      expect(result.id).to_not be(nil)
      expect(result.started_at).to_not be(nil)
      expect(result.completed?).to be(true)
      expect(result.failed?).to be(false)
            expect(result.triggered_event_json['uuid']).to eq(prepared_event.uuid)
      expect(result.triggered_event_json['swishjam_api_key']).to eq(prepared_event.swishjam_api_key)
      expect(result.triggered_event_json['name']).to eq(prepared_event.name)
      expect(result.triggered_event_json['user_profile_id']).to eq(prepared_event.user_profile_id)
      expect(result.triggered_event_json['organization_profile_id']).to eq(prepared_event.organization_profile_id)
      expect(result.triggered_event_json['properties']).to eq(prepared_event.properties)
      expect(result.triggered_event_json['user_properties']).to eq(prepared_event.user_properties)
      expect(result.triggered_event_json['organization_properties']).to eq(prepared_event.organization_properties)
      expect(result.triggered_event_json['occurred_at'].to_time.round(2)).to eq(prepared_event.occurred_at.to_time.round(2))

      expect(second_result).to be(false)
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
      
      result = EventTriggers::ResendEmailInvoker.new(event_trigger_step, prepared_event).invoke_or_schedule_email_delivery_if_necessary
      second_result = EventTriggers::ResendEmailInvoker.new(event_trigger_step, second_prepared_event).invoke_or_schedule_email_delivery_if_necessary
      
      expect(TriggeredEventTriggerStep.count).to be(2)
      expect(result.class).to be(TriggeredEventTriggerStep)
      expect(result.id).to_not be(nil)
      expect(result.started_at).to_not be(nil)
      expect(result.completed?).to be(true)
      expect(result.failed?).to be(false)
            expect(result.triggered_event_json['uuid']).to eq(prepared_event.uuid)
      expect(result.triggered_event_json['swishjam_api_key']).to eq(prepared_event.swishjam_api_key)
      expect(result.triggered_event_json['name']).to eq(prepared_event.name)
      expect(result.triggered_event_json['user_profile_id']).to eq(prepared_event.user_profile_id)
      expect(result.triggered_event_json['organization_profile_id']).to eq(prepared_event.organization_profile_id)
      expect(result.triggered_event_json['properties']).to eq(prepared_event.properties)
      expect(result.triggered_event_json['user_properties']).to eq(prepared_event.user_properties)
      expect(result.triggered_event_json['organization_properties']).to eq(prepared_event.organization_properties)
      expect(result.triggered_event_json['occurred_at'].to_time.round(2)).to eq(prepared_event.occurred_at.to_time.round(2))

      expect(second_result.class).to be(TriggeredEventTriggerStep)
      expect(second_result.id).to_not be(nil)
      expect(second_result.started_at).to_not be(nil)
      expect(second_result.completed_at).to_not be(nil)
      expect(second_result.error_message).to be(nil)
      expect(second_result.triggered_event_json['uuid']).to eq(second_prepared_event.uuid)
      expect(second_result.triggered_event_json['swishjam_api_key']).to eq(second_prepared_event.swishjam_api_key)
      expect(second_result.triggered_event_json['name']).to eq(second_prepared_event.name)
      expect(second_result.triggered_event_json['user_profile_id']).to eq(second_prepared_event.user_profile_id)
      expect(second_result.triggered_event_json['organization_profile_id']).to eq(second_prepared_event.organization_profile_id)
      expect(second_result.triggered_event_json['properties']).to eq(second_prepared_event.properties)
      expect(second_result.triggered_event_json['user_properties']).to eq(second_prepared_event.user_properties)
      expect(second_result.triggered_event_json['organization_properties']).to eq(second_prepared_event.organization_properties)
      expect(second_result.triggered_event_json['occurred_at'].to_time.round(2)).to eq(second_prepared_event.occurred_at.to_time.round(2))
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
      
      result = EventTriggers::ResendEmailInvoker.new(event_trigger_step, prepared_event).invoke_or_schedule_email_delivery_if_necessary
      second_result = EventTriggers::ResendEmailInvoker.new(event_trigger_step, second_prepared_event).invoke_or_schedule_email_delivery_if_necessary

      expect(TriggeredEventTriggerStep.count).to be(2)
      expect(result.class).to be(TriggeredEventTriggerStep)
      expect(result.id).to_not be(nil)
      expect(result.started_at).to_not be(nil)
      expect(result.completed?).to be(true)
      expect(result.failed?).to be(false)
      expect(result.triggered_event_json['uuid']).to eq(prepared_event.uuid)
      expect(result.triggered_event_json['swishjam_api_key']).to eq(prepared_event.swishjam_api_key)
      expect(result.triggered_event_json['name']).to eq(prepared_event.name)
      expect(result.triggered_event_json['user_profile_id']).to eq(prepared_event.user_profile_id)
      expect(result.triggered_event_json['organization_profile_id']).to eq(prepared_event.organization_profile_id)
      expect(result.triggered_event_json['properties']).to eq(prepared_event.properties)
      expect(result.triggered_event_json['user_properties']).to eq(prepared_event.user_properties)
      expect(result.triggered_event_json['organization_properties']).to eq(prepared_event.organization_properties)
      expect(result.triggered_event_json['occurred_at'].to_time.round(2)).to eq(prepared_event.occurred_at.to_time.round(2))

      expect(second_result.class).to be(TriggeredEventTriggerStep)
      expect(second_result.id).to_not be(nil)
      expect(second_result.started_at).to_not be(nil)
      expect(second_result.completed_at).to_not be(nil)
      expect(second_result.error_message).to be(nil)
      expect(second_result.triggered_event_json['uuid']).to eq(second_prepared_event.uuid)
      expect(second_result.triggered_event_json['swishjam_api_key']).to eq(second_prepared_event.swishjam_api_key)
      expect(second_result.triggered_event_json['name']).to eq(second_prepared_event.name)
      expect(second_result.triggered_event_json['user_profile_id']).to eq(second_prepared_event.user_profile_id)
      expect(second_result.triggered_event_json['organization_profile_id']).to eq(second_prepared_event.organization_profile_id)
      expect(second_result.triggered_event_json['properties']).to eq(second_prepared_event.properties)
      expect(second_result.triggered_event_json['user_properties']).to eq(second_prepared_event.user_properties)
      expect(second_result.triggered_event_json['organization_properties']).to eq(second_prepared_event.organization_properties)
      expect(second_result.triggered_event_json['occurred_at'].to_time.round(2)).to eq(second_prepared_event.occurred_at.to_time.round(2))
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

      result = EventTriggers::ResendEmailInvoker.new(event_trigger_step, prepared_event).invoke_or_schedule_email_delivery_if_necessary

      expect(result.class).to be(TriggeredEventTriggerStep)
      expect(result.id).to_not be(nil)
      expect(result.started_at).to_not be(nil)
      expect(result.completed?).to be(true)
      expect(result.triggered_event_json['uuid']).to eq(prepared_event.uuid)
      expect(result.triggered_event_json['swishjam_api_key']).to eq(prepared_event.swishjam_api_key)
      expect(result.triggered_event_json['name']).to eq(prepared_event.name)
      expect(result.triggered_event_json['user_profile_id']).to eq(prepared_event.user_profile_id)
      expect(result.triggered_event_json['organization_profile_id']).to eq(prepared_event.organization_profile_id)
      expect(result.triggered_event_json['properties']).to eq(prepared_event.properties)
      expect(result.triggered_event_json['user_properties']).to eq(prepared_event.user_properties)
      expect(result.triggered_event_json['organization_properties']).to eq(prepared_event.organization_properties)
      expect(result.triggered_event_json['occurred_at'].to_time.round(2)).to eq(prepared_event.occurred_at.to_time.round(2))
      expect(result.error_message).to eq("Prevented email from being sent with unresolved variables.")
      expect(result.triggered_payload).to eq({ 
        'resend_request_body' => {
          'from' => 'jenny@gmail.com',
          'to' => 'johnny@gmail.com',
          'subject' => 'Hello John!',
          'text' => "Hey John,\nHow are you?Here's a link to our website: {event.website_link}",
        }
      })
      expect(TriggeredEventTriggerStep.count).to be(1)
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

      result = EventTriggers::ResendEmailInvoker.new(event_trigger_step, prepared_event).invoke_or_schedule_email_delivery_if_necessary

      expect(TriggeredEventTriggerStep.count).to be(1)
      expect(result.class).to be(TriggeredEventTriggerStep)
      expect(result.id).to_not be(nil)
      expect(result.started_at).to_not be(nil)
      expect(result.completed?).to be(true)
      expect(result.failed?).to be(false)
      expect(result.triggered_event_json['uuid']).to eq(prepared_event.uuid)
      expect(result.triggered_event_json['swishjam_api_key']).to eq(prepared_event.swishjam_api_key)
      expect(result.triggered_event_json['name']).to eq(prepared_event.name)
      expect(result.triggered_event_json['user_profile_id']).to eq(prepared_event.user_profile_id)
      expect(result.triggered_event_json['organization_profile_id']).to eq(prepared_event.organization_profile_id)
      expect(result.triggered_event_json['properties']).to eq(prepared_event.properties)
      expect(result.triggered_event_json['user_properties']).to eq(prepared_event.user_properties)
      expect(result.triggered_event_json['organization_properties']).to eq(prepared_event.organization_properties)
      expect(result.triggered_event_json['occurred_at'].to_time.round(2)).to eq(prepared_event.occurred_at.to_time.round(2))
      expect(result.triggered_payload).to eq({
        'resend_request_body' => {
          'from' => 'jenny@gmail.com',
          'to' => 'johnny@gmail.com',
          'subject' => 'Hello John!',
          'text' => "Hey John,\nHow are you?Here's a link to our website: {event.website_link}",
        },
        'resend_response' => { 'id' => 'some-resend-email-id' },
      })
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

      result = EventTriggers::ResendEmailInvoker.new(event_trigger_step, prepared_event).invoke_or_schedule_email_delivery_if_necessary

      expect(result.class).to be(TriggeredEventTriggerStep)
      expect(TriggeredEventTriggerStep.count).to be(1)
      expect(result.id).to_not be(nil)
      expect(result.completed?).to be(true)
      expect(result.failed?).to be(false)
      expect(result.started_at).to_not be(nil)
      expect(result.triggered_event_json['uuid']).to eq(prepared_event.uuid)
      expect(result.triggered_event_json['swishjam_api_key']).to eq(prepared_event.swishjam_api_key)
      expect(result.triggered_event_json['name']).to eq(prepared_event.name)
      expect(result.triggered_event_json['user_profile_id']).to eq(prepared_event.user_profile_id)
      expect(result.triggered_event_json['organization_profile_id']).to eq(prepared_event.organization_profile_id)
      expect(result.triggered_event_json['properties']).to eq(prepared_event.properties)
      expect(result.triggered_event_json['user_properties']).to eq(prepared_event.user_properties)
      expect(result.triggered_event_json['organization_properties']).to eq(prepared_event.organization_properties)
      expect(result.triggered_event_json['occurred_at'].to_time.round(2)).to eq(prepared_event.occurred_at.to_time.round(2))
      expect(result.triggered_payload).to eq({
        'resend_request_body' => {
          'from' => 'jenny@gmail.com',
          'to' => 'john@example.com',
          'subject' => 'Hello John!',
          'text' => "Hey John,\nHow are you?Here's a link to our website: https://example.com",
          'cc' => 'circle-back@gmail.com',
          'bcc' => 'secret-sally@gmail.com',
        },
        'resend_response' => { 'id' => 'some-resend-email-id' },
      })
    end

    it 'schedules the Resend email delivery when the `delay_delivery_by_minutes` config is present and saves the `triggered_event_trigger_step` in a pending state' do
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
          delay_delivery_by_minutes: 5,
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
      
      expect_no_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'john@example.com',
        subject: 'Hello John!',
        text: "Hey John,\nHow are you?Here's a link to our website: https://example.com",
        cc: 'circle-back@gmail.com',
        bcc: 'secret-sally@gmail.com',
      })

      frozen_time = Time.now
      allow(Time).to receive(:current).and_return(frozen_time)

      expect(ScheduledEventTriggerStepJob).to receive(:perform_in).with(5.minutes, anything()).exactly(1).times

      result = EventTriggers::ResendEmailInvoker.new(event_trigger_step, prepared_event).invoke_or_schedule_email_delivery_if_necessary
      
      expect(result.class).to be(TriggeredEventTriggerStep)
      expect(TriggeredEventTriggerStep.count).to be(1)
      expect(result.id).to_not be(nil)
      expect(result.completed?).to be(false)
      expect(result.failed?).to be(false)
      expect(result.started_at).to_not be(nil)
      expect(result.triggered_event_json['uuid']).to eq(prepared_event.uuid)
      expect(result.triggered_event_json['swishjam_api_key']).to eq(prepared_event.swishjam_api_key)
      expect(result.triggered_event_json['name']).to eq(prepared_event.name)
      expect(result.triggered_event_json['user_profile_id']).to eq(prepared_event.user_profile_id)
      expect(result.triggered_event_json['organization_profile_id']).to eq(prepared_event.organization_profile_id)
      expect(result.triggered_event_json['properties']).to eq(prepared_event.properties)
      expect(result.triggered_event_json['user_properties']).to eq(prepared_event.user_properties)
      expect(result.triggered_event_json['organization_properties']).to eq(prepared_event.organization_properties)
      expect(result.triggered_event_json['occurred_at'].to_time.round(2)).to eq(prepared_event.occurred_at.to_time.round(2))
      expect(result.triggered_payload['resend_request_body']).to eq({
        'from' => 'jenny@gmail.com',
        'to' => 'john@example.com',
        'subject' => 'Hello John!',
        'text' => "Hey John,\nHow are you?Here's a link to our website: https://example.com",
        'cc' => 'circle-back@gmail.com',
        'bcc' => 'secret-sally@gmail.com',
      })
      expect(result.triggered_payload['delayed_delivery_at'].to_time.round(2)).to eq(frozen_time.round(2))
      expect(result.triggered_payload['scheduled_delivery_for'].to_time.round(2)).to eq((frozen_time + 5.minutes).round(2))
    end

    it 'delivers the Resend email when the `delay_delivery_by_minutes` config is present, but the `delayed_delivery_at` attribute is present in the `triggered_event_trigger_step.trigger_payload`' do
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
          delay_delivery_by_minutes: 5,
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
      
      # will get triggered on the ScheduledEventTriggerStepJob.perform_sync
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'john@example.com',
        subject: 'Hello John!',
        text: "Hey John,\nHow are you?Here's a link to our website: https://example.com",
        cc: 'circle-back@gmail.com',
        bcc: 'secret-sally@gmail.com',
      }).exactly(1).times

      frozen_time = Time.now
      allow(Time).to receive(:current).and_return(frozen_time)

      expect(ScheduledEventTriggerStepJob).to receive(:perform_in).with(5.minutes, anything()).exactly(1).times

      result = EventTriggers::ResendEmailInvoker.new(event_trigger_step, prepared_event).invoke_or_schedule_email_delivery_if_necessary
      
      expect(result.class).to be(TriggeredEventTriggerStep)
      expect(TriggeredEventTriggerStep.count).to be(1)
      expect(result.id).to_not be(nil)
      expect(result.started_at).to_not be(nil)
      expect(result.completed?).to be(false)
      expect(result.pending?).to be(true)
      expect(result.failed?).to be(false)
      expect(result.triggered_event_json['uuid']).to eq(prepared_event.uuid)
      expect(result.triggered_event_json['swishjam_api_key']).to eq(prepared_event.swishjam_api_key)
      expect(result.triggered_event_json['name']).to eq(prepared_event.name)
      expect(result.triggered_event_json['user_profile_id']).to eq(prepared_event.user_profile_id)
      expect(result.triggered_event_json['organization_profile_id']).to eq(prepared_event.organization_profile_id)
      expect(result.triggered_event_json['properties']).to eq(prepared_event.properties)
      expect(result.triggered_event_json['user_properties']).to eq(prepared_event.user_properties)
      expect(result.triggered_event_json['organization_properties']).to eq(prepared_event.organization_properties)
      expect(result.triggered_event_json['occurred_at'].to_time.round(2)).to eq(prepared_event.occurred_at.to_time.round(2))
      expect(result.triggered_payload['resend_request_body']).to eq({
        'from' => 'jenny@gmail.com',
        'to' => 'john@example.com',
        'subject' => 'Hello John!',
        'text' => "Hey John,\nHow are you?Here's a link to our website: https://example.com",
        'cc' => 'circle-back@gmail.com',
        'bcc' => 'secret-sally@gmail.com',
      })
      expect(result.triggered_payload['delayed_delivery_at'].to_time.round(2)).to eq(frozen_time.round(2))
      expect(result.triggered_payload['scheduled_delivery_for'].to_time.round(2)).to eq((frozen_time + 5.minutes).round(2))

      # simulating the ScheduledEventTriggerStepJob being performed in the future
      expect(EventTriggers::ResendEmailInvoker).to receive(:new)
                                                  .with(event_trigger_step, anything(), triggered_event_trigger_step: result)
                                                  .and_call_original
                                                  .exactly(1).times
      
      ScheduledEventTriggerStepJob.perform_sync(result.id)
      
      result.reload
      expect(result.completed?).to be(true)
      expect(result.failed?).to be(false)
      expect(result.failed?).to be(false)
    end
  end
end