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

  def build_new_prepared_event(
    uuid: '1', 
    swishjam_api_key: 'xyz', 
    name: 'my_event_to_trigger_off_of', 
    properties: { website_link: 'https://example.com' }, 
    user_properties: { name: 'John', email: 'john@gmail.com' },
    occurred_at: Time.current
  )
    Ingestion::ParsedEventFromIngestion.new(
      uuid: uuid,
      swishjam_api_key: swishjam_api_key,
      name: name,
      properties: properties,
      user_properties: user_properties,
      occurred_at: occurred_at,
    )
  end

  before do
    TriggeredEventTrigger.destroy_all
    @workspace = FactoryBot.create(:workspace)
    FactoryBot.create(:resend_destination, workspace: @workspace, config: { api_key: 'a_resend_api_key!' })
    @event_trigger = FactoryBot.create(:event_trigger, workspace: @workspace, event_name: 'my_event_to_trigger_off_of')
    @triggered_event_trigger = TriggeredEventTrigger.create!(
      workspace: @workspace, 
      event_trigger: @event_trigger,
      # stubbing these, shouldn't be necessary
      seconds_from_occurred_at_to_triggered: 1,
      event_json: {}, 
      event_uuid: '1',
    )
    @triggered_event_trigger_2 = TriggeredEventTrigger.create!(
      workspace: @workspace, 
      event_trigger: @event_trigger,
      # stubbing these, shouldn't be necessary
      seconds_from_occurred_at_to_triggered: 1,
      event_json: {}, 
      event_uuid: '2',
    )
    @event_trigger_step = FactoryBot.create(:resend_email_event_trigger_step, 
      event_trigger: @event_trigger, 
      config: {
        to: '{user.email}',
        from: 'jenny@gmail.com',
        subject: 'Hello {user.name}!',
        body: "Hey {user.name},\nHow are you?Here's a link to our website: {event.website_link}",
        send_once_per_user: true,
        un_resolved_variable_safety_net: true,
      }
    )
  end

  describe '#invoke_or_schedule_email_delivery_if_necessary!' do
    it 'triggers a Resend email when all conditions are met' do
      
      prepared_event = build_new_prepared_event
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'john@gmail.com',
        subject: 'Hello John!',
        text: "Hey John,\nHow are you?Here's a link to our website: https://example.com",
      })
      
      result = EventTriggers::ResendEmailInvoker.new(
        trigger_step: @event_trigger_step, 
        prepared_event: prepared_event,
        triggered_event_trigger: @triggered_event_trigger,
      ).invoke_or_schedule_email_delivery_if_necessary
      
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
          'to' => 'john@gmail.com',
          'subject' => 'Hello John!',
          'text' => "Hey John,\nHow are you?Here's a link to our website: https://example.com",
        },
        'resend_response' => { 'id' => 'some-resend-email-id' },
      })
    end

    it 'does not trigger a Resend email when the `send_once_per_user` config is set to true and this event_trigger has already sent an email to this address' do
      prepared_event = build_new_prepared_event
      prepared_event_2 = build_new_prepared_event(
        uuid: '2', 
        properties: { website_link: 'https://a-different-link-example.com' },
        user_properties: { name: 'A different name?', email: 'john@gmail.com' },
      )
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'john@gmail.com',
        subject: "Hello #{prepared_event.user_properties['name']}!",
        text: "Hey #{prepared_event.user_properties['name']},\nHow are you?Here's a link to our website: #{prepared_event.properties['website_link']}",
      })
      expect_no_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'john@gmail.com',
        subject: "Hello #{prepared_event_2.user_properties['name']}!",
        text: "Hey #{prepared_event_2.user_properties['name']},\nHow are you?Here's a link to our website: #{prepared_event_2.properties['website_link']}",
      })
      
      result = EventTriggers::ResendEmailInvoker.new(
        trigger_step: @event_trigger_step, 
        prepared_event: prepared_event,
        triggered_event_trigger: @triggered_event_trigger,
      ).invoke_or_schedule_email_delivery_if_necessary
      result_2 = EventTriggers::ResendEmailInvoker.new(
        trigger_step: @event_trigger_step, 
        prepared_event: prepared_event_2,
        triggered_event_trigger: @triggered_event_trigger_2,
      ).invoke_or_schedule_email_delivery_if_necessary
      
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

      expect(result_2.id).to_not be(nil)
      expect(result_2.started_at).to_not be(nil)
      expect(result_2.completed?).to be(true)
      expect(result_2.failed?).to be(true)
      expect(result_2.error_message).to eq("Prevented multiple Resend triggers for user john@gmail.com.")
      expect(result_2.triggered_event_json['uuid']).to eq(prepared_event_2.uuid)
      expect(result_2.triggered_event_json['swishjam_api_key']).to eq(prepared_event_2.swishjam_api_key)
      expect(result_2.triggered_event_json['name']).to eq(prepared_event_2.name)
      expect(result_2.triggered_event_json['user_profile_id']).to eq(prepared_event_2.user_profile_id)
      expect(result_2.triggered_event_json['organization_profile_id']).to eq(prepared_event_2.organization_profile_id)
      expect(result_2.triggered_event_json['properties']).to eq(prepared_event_2.properties)
      expect(result_2.triggered_event_json['user_properties']).to eq(prepared_event_2.user_properties)
      expect(result_2.triggered_event_json['organization_properties']).to eq(prepared_event_2.organization_properties)
      expect(result_2.triggered_event_json['occurred_at'].to_time.round(2)).to eq(prepared_event_2.occurred_at.to_time.round(2))
    end

    it 'does trigger a Resend email when the `send_once_per_user` config is set to true and this event_trigger has only sent emails to different email addresses' do
      prepared_event = build_new_prepared_event
      prepared_event_2 = build_new_prepared_event(
        uuid: '2', 
        properties: { website_link: 'https://a-different-link-example.com' },
        user_properties: { name: 'A different name?', email: 'bob@gmail.com' },
      )
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'john@gmail.com',
        subject: "Hello #{prepared_event.user_properties['name']}!",
        text: "Hey #{prepared_event.user_properties['name']},\nHow are you?Here's a link to our website: #{prepared_event.properties['website_link']}",
      })
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'bob@gmail.com',
        subject: "Hello #{prepared_event_2.user_properties['name']}!",
        text: "Hey #{prepared_event_2.user_properties['name']},\nHow are you?Here's a link to our website: #{prepared_event_2.properties['website_link']}",
      })
      
      result = EventTriggers::ResendEmailInvoker.new(
        trigger_step: @event_trigger_step, 
        prepared_event: prepared_event,
        triggered_event_trigger: @triggered_event_trigger,
      ).invoke_or_schedule_email_delivery_if_necessary
      result_2 = EventTriggers::ResendEmailInvoker.new(
        trigger_step: @event_trigger_step, 
        prepared_event: prepared_event_2,
        triggered_event_trigger: @triggered_event_trigger_2,
      ).invoke_or_schedule_email_delivery_if_necessary
      
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

      expect(result_2.class).to be(TriggeredEventTriggerStep)
      expect(result_2.id).to_not be(nil)
      expect(result_2.started_at).to_not be(nil)
      expect(result_2.completed_at).to_not be(nil)
      expect(result_2.error_message).to be(nil)
      expect(result_2.triggered_event_json['uuid']).to eq(prepared_event_2.uuid)
      expect(result_2.triggered_event_json['swishjam_api_key']).to eq(prepared_event_2.swishjam_api_key)
      expect(result_2.triggered_event_json['name']).to eq(prepared_event_2.name)
      expect(result_2.triggered_event_json['user_profile_id']).to eq(prepared_event_2.user_profile_id)
      expect(result_2.triggered_event_json['organization_profile_id']).to eq(prepared_event_2.organization_profile_id)
      expect(result_2.triggered_event_json['properties']).to eq(prepared_event_2.properties)
      expect(result_2.triggered_event_json['user_properties']).to eq(prepared_event_2.user_properties)
      expect(result_2.triggered_event_json['organization_properties']).to eq(prepared_event_2.organization_properties)
      expect(result_2.triggered_event_json['occurred_at'].to_time.round(2)).to eq(prepared_event_2.occurred_at.to_time.round(2))
    end

    it 'does trigger a Resend email when the `send_once_per_user` config is set to false and this event_trigger has already sent an email to this address' do
      prepared_event = build_new_prepared_event
      prepared_event_2 = build_new_prepared_event(
        uuid: '2',
        properties: { website_link: 'https://a-different-link-example.com' },
        user_properties: { name: 'A different name?', email: 'bob@gmail.com' },
      )
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'john@gmail.com',
        subject: "Hello #{prepared_event.user_properties['name']}!",
        text: "Hey #{prepared_event.user_properties['name']},\nHow are you?Here's a link to our website: #{prepared_event.properties['website_link']}",
      })
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'bob@gmail.com',
        subject: "Hello #{prepared_event_2.user_properties['name']}!",
        text: "Hey #{prepared_event_2.user_properties['name']},\nHow are you?Here's a link to our website: #{prepared_event_2.properties['website_link']}",
      })
      
      result = EventTriggers::ResendEmailInvoker.new(
        trigger_step: @event_trigger_step, 
        prepared_event: prepared_event,
        triggered_event_trigger: @triggered_event_trigger,
      ).invoke_or_schedule_email_delivery_if_necessary
      result_2 = EventTriggers::ResendEmailInvoker.new(
        trigger_step: @event_trigger_step, 
        prepared_event: prepared_event_2,
        triggered_event_trigger: @triggered_event_trigger_2,
      ).invoke_or_schedule_email_delivery_if_necessary

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

      expect(result_2.class).to be(TriggeredEventTriggerStep)
      expect(result_2.id).to_not be(nil)
      expect(result_2.started_at).to_not be(nil)
      expect(result_2.completed_at).to_not be(nil)
      expect(result_2.error_message).to be(nil)
      expect(result_2.triggered_event_json['uuid']).to eq(prepared_event_2.uuid)
      expect(result_2.triggered_event_json['swishjam_api_key']).to eq(prepared_event_2.swishjam_api_key)
      expect(result_2.triggered_event_json['name']).to eq(prepared_event_2.name)
      expect(result_2.triggered_event_json['user_profile_id']).to eq(prepared_event_2.user_profile_id)
      expect(result_2.triggered_event_json['organization_profile_id']).to eq(prepared_event_2.organization_profile_id)
      expect(result_2.triggered_event_json['properties']).to eq(prepared_event_2.properties)
      expect(result_2.triggered_event_json['user_properties']).to eq(prepared_event_2.user_properties)
      expect(result_2.triggered_event_json['organization_properties']).to eq(prepared_event_2.organization_properties)
      expect(result_2.triggered_event_json['occurred_at'].to_time.round(2)).to eq(prepared_event_2.occurred_at.to_time.round(2))
    end

    it 'does not trigger a Resend email when the `un_resolved_variable_safety_net` config is set to true and there are un resolved variables in the Resend request payload' do
      prepared_event = build_new_prepared_event(properties: { a_different_key_than_the_variables_in_the_trigger_step: 'foo!' })
      expect(HTTParty).not_to receive(:post)

      result = EventTriggers::ResendEmailInvoker.new(
        trigger_step: @event_trigger_step, 
        prepared_event: prepared_event,
        triggered_event_trigger: @triggered_event_trigger,
      ).invoke_or_schedule_email_delivery_if_necessary

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
          'to' => 'john@gmail.com',
          'subject' => 'Hello John!',
          'text' => "Hey John,\nHow are you?Here's a link to our website: {event.website_link}",
        }
      })
      expect(TriggeredEventTriggerStep.count).to be(1)
    end

    it 'does trigger a Resend email when the `un_resolved_variable_safety_net` config is set to false and there are un resolved variables in the Resend request payload' do
      @event_trigger_step.config['un_resolved_variable_safety_net'] = false
      @event_trigger_step.save!

      prepared_event = build_new_prepared_event(properties: { missing_website_link_var: 'foo!' })
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'john@gmail.com',
        subject: 'Hello John!',
        text: "Hey John,\nHow are you?Here's a link to our website: {event.website_link}",
      }).exactly(1).times

      result = EventTriggers::ResendEmailInvoker.new(
        trigger_step: @event_trigger_step, 
        prepared_event: prepared_event,
        triggered_event_trigger: @triggered_event_trigger,
      ).invoke_or_schedule_email_delivery_if_necessary

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
          'to' => 'john@gmail.com',
          'subject' => 'Hello John!',
          'text' => "Hey John,\nHow are you?Here's a link to our website: {event.website_link}",
        },
        'resend_response' => { 'id' => 'some-resend-email-id' },
      })
    end

    it 'includes the `cc` and `bcc` fields in the Resend request payload when they are present in the config' do
      @event_trigger_step.config['cc'] = 'circle-back@gmail.com'
      @event_trigger_step.config['bcc'] = 'secret-sally@gmail.com'
      @event_trigger_step.save!

      prepared_event = build_new_prepared_event
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'john@gmail.com',
        subject: 'Hello John!',
        text: "Hey John,\nHow are you?Here's a link to our website: https://example.com",
        cc: 'circle-back@gmail.com',
        bcc: 'secret-sally@gmail.com',
      })

      result = EventTriggers::ResendEmailInvoker.new(
        trigger_step: @event_trigger_step, 
        prepared_event: prepared_event,
        triggered_event_trigger: @triggered_event_trigger,
      ).invoke_or_schedule_email_delivery_if_necessary

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
          'to' => 'john@gmail.com',
          'subject' => 'Hello John!',
          'text' => "Hey John,\nHow are you?Here's a link to our website: https://example.com",
          'cc' => 'circle-back@gmail.com',
          'bcc' => 'secret-sally@gmail.com',
        },
        'resend_response' => { 'id' => 'some-resend-email-id' },
      })
    end

    it 'schedules the Resend email delivery when the `delay_delivery_by_minutes` config is present and saves the `triggered_event_trigger_step` in a pending state' do
      @event_trigger_step.config['delay_delivery_by_minutes'] = 5
      @event_trigger_step.save!

      prepared_event = build_new_prepared_event
      expect_no_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'john@gmail.com',
        subject: 'Hello John!',
        text: "Hey John,\nHow are you?Here's a link to our website: https://example.com",
      })

      frozen_time = Time.now
      allow(Time).to receive(:current).and_return(frozen_time)

      expect(ScheduledEventTriggerStepJob).to receive(:perform_in).with(5.minutes, anything()).exactly(1).times

      result = EventTriggers::ResendEmailInvoker.new(
        trigger_step: @event_trigger_step, 
        prepared_event: prepared_event,
        triggered_event_trigger: @triggered_event_trigger,
      ).invoke_or_schedule_email_delivery_if_necessary
      
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
        'to' => 'john@gmail.com',
        'subject' => 'Hello John!',
        'text' => "Hey John,\nHow are you?Here's a link to our website: https://example.com",
      })
      expect(result.triggered_payload['delayed_delivery_at'].to_time.round(2)).to eq(frozen_time.round(2))
      expect(result.triggered_payload['scheduled_delivery_for'].to_time.round(2)).to eq((frozen_time + 5.minutes).round(2))
    end

    it 'delivers the Resend email when the `delay_delivery_by_minutes` config is present, but the `delayed_delivery_at` attribute is present in the `triggered_event_trigger_step.trigger_payload`' do
      @event_trigger_step.config['delay_delivery_by_minutes'] = 5
      @event_trigger_step.save!
      prepared_event = build_new_prepared_event
      
      # will get triggered on the ScheduledEventTriggerStepJob.perform_sync
      expect_resend_api_request('a_resend_api_key!', {
        from: 'jenny@gmail.com',
        to: 'john@gmail.com',
        subject: 'Hello John!',
        text: "Hey John,\nHow are you?Here's a link to our website: https://example.com",
      }).exactly(1).times

      frozen_time = Time.now
      allow(Time).to receive(:current).and_return(frozen_time)

      expect(ScheduledEventTriggerStepJob).to receive(:perform_in).with(5.minutes, anything()).exactly(1).times

      result = EventTriggers::ResendEmailInvoker.new(
        trigger_step: @event_trigger_step, 
        prepared_event: prepared_event,
        triggered_event_trigger: @triggered_event_trigger,
      ).invoke_or_schedule_email_delivery_if_necessary
      
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
        'to' => 'john@gmail.com',
        'subject' => 'Hello John!',
        'text' => "Hey John,\nHow are you?Here's a link to our website: https://example.com",
      })
      expect(result.triggered_payload['delayed_delivery_at'].to_time.round(2)).to eq(frozen_time.round(2))
      expect(result.triggered_payload['scheduled_delivery_for'].to_time.round(2)).to eq((frozen_time + 5.minutes).round(2))

      # simulating the ScheduledEventTriggerStepJob being performed in the future
      expect(EventTriggers::ResendEmailInvoker).to receive(:new)
                                                  .with(
                                                    trigger_step: @event_trigger_step, 
                                                    prepared_event: anything(), 
                                                    triggered_event_trigger_step: result,
                                                  )
                                                  .and_call_original
                                                  .exactly(1).times
      
      ScheduledEventTriggerStepJob.perform_sync(result.id)
      
      result.reload
      expect(result.completed?).to be(true)
      expect(result.failed?).to be(false)
      expect(result.failed?).to be(false)
      expect(result.triggered_payload['delayed_delivery_at']).to be(nil)
      expect(result.triggered_payload['scheduled_delivery_for']).to be(nil)
      expect(result.triggered_payload['was_scheduled']).to be(true)
    end
  end
end