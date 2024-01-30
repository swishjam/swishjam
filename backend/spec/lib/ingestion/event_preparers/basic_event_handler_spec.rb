require 'spec_helper'

describe Ingestion::EventPreparers::BasicEventHandler do
  def parsed_event(swishjam_api_key:, name: 'some_random_event', timestamp: 10.minutes.ago, properties: {})
    Ingestion::ParsedEventFromIngestion.new({
      'uuid' => 'evt-123',
      'swishjam_api_key' => swishjam_api_key,
      'name' => name,
      'occurred_at' => timestamp.to_f,
      'properties' => {
        'device_fingerprint' => 'abc',
        'device_identifier' => '123',
      }.merge(properties),
    })
  end

  before do
    @workspace = FactoryBot.create(:workspace)
    @public_key = @workspace.api_keys.for_data_source!('product').public_key
  end

  describe '#handle_and_return_prepared_events!' do
    it 'returns an the event_json without any user profile if the event payload does not provide a user_id or device_identifier' do
      event = Ingestion::EventPreparers::BasicEventHandler.new(
        parsed_event(
          swishjam_api_key: @public_key,
          properties: { a_property: 'a_value', device_identifier: nil, device_fingerprint: nil }
        )
      ).handle_and_return_prepared_events!

      expect(@workspace.analytics_user_profiles.count).to be(0)
      expect(@workspace.analytics_user_profile_devices.count).to be(0)

      expect(event.uuid).to eq('evt-123')
      expect(event.swishjam_api_key).to eq(@public_key)
      expect(event.name).to eq('some_random_event')
      expect(event.user_profile_id).to be(nil)
      expect(event.sanitized_properties['a_property']).to eq('a_value')
      expect(event.sanitized_properties.keys.count).to be(1)
    end

    it 'creates a new device if the provided device_identifier does not exist and a new anonymous user profile if there is no user identifier provided' do
      expect(@workspace.analytics_user_profiles.count).to be(0)
      expect(@workspace.analytics_user_profile_devices.count).to be(0)
      
      event = Ingestion::EventPreparers::BasicEventHandler.new(
        parsed_event(
          swishjam_api_key: @public_key,
          properties: { a_property: 'a_value' }
        )
      ).handle_and_return_prepared_events!

      expect(@workspace.analytics_user_profiles.count).to be(1)
      expect(@workspace.analytics_user_profile_devices.count).to be(1)

      expect(@workspace.analytics_user_profile_devices.first.swishjam_cookie_value).to eq('123')
      expect(@workspace.analytics_user_profile_devices.first.device_fingerprint).to eq('abc')
      expect(@workspace.analytics_user_profile_devices.first.analytics_user_profile_id).to eq(@workspace.analytics_user_profiles.first.id)

      expect(@workspace.analytics_user_profiles.first.user_unique_identifier).to be(nil)
      expect(@workspace.analytics_user_profiles.first.email).to be(nil)
      expect(@workspace.analytics_user_profiles.first.metadata).to eq({})

      expect(event.uuid).to eq('evt-123')
      expect(event.swishjam_api_key).to eq(@public_key)
      expect(event.name).to eq('some_random_event')
      expect(event.user_profile_id).to eq(@workspace.analytics_user_profiles.first.id)
      expect(event.sanitized_properties['a_property']).to eq('a_value')
      expect(event.sanitized_properties.keys.count).to be(1)
    end

    it 'uses the existing device\'s owner as the user associated to the event if the provided device_identifier already has a device' do
      existing_user = FactoryBot.create(:analytics_user_profile, 
        workspace: @workspace,
        user_unique_identifier: 'xyz',
        email: 'jenny@swishjam.com',
        metadata: { 
          first_name: 'Jenny',
          last_name: 'Rosen',
          birthday: '11/07/1992' 
        }
      )

      existing_device = FactoryBot.create(:analytics_user_profile_device,
        workspace: @workspace,
        analytics_user_profile: existing_user,
        swishjam_cookie_value: '123',
        device_fingerprint: 'abc',
      )
      
      event = Ingestion::EventPreparers::BasicEventHandler.new(
        parsed_event(
          swishjam_api_key: @public_key,
          properties: { 
            a_property: 'a_value',
            device_identifier: existing_device.swishjam_cookie_value,
            user: {
              birthday: '01/01/1990',
              susbcription_plan: 'Gold'
            }
          }
        )
      ).handle_and_return_prepared_events!

      expect(@workspace.analytics_user_profiles.count).to be(1)
      expect(@workspace.analytics_user_profile_devices.count).to be(1)

      expect(@workspace.analytics_user_profile_devices.first.swishjam_cookie_value).to eq('123')
      expect(@workspace.analytics_user_profile_devices.first.device_fingerprint).to eq('abc')
      expect(@workspace.analytics_user_profile_devices.first.analytics_user_profile_id).to eq(existing_user.id)

      expect(@workspace.analytics_user_profiles.first.user_unique_identifier).to eq('xyz')
      expect(@workspace.analytics_user_profiles.first.email).to eq('jenny@swishjam.com')
      expect(@workspace.analytics_user_profiles.first.metadata['first_name']).to eq('Jenny')
      expect(@workspace.analytics_user_profiles.first.metadata['last_name']).to eq('Rosen')
      expect(@workspace.analytics_user_profiles.first.metadata['birthday']).to eq('11/07/1992')

      expect(event.uuid).to eq('evt-123')
      expect(event.swishjam_api_key).to eq(@public_key)
      expect(event.name).to eq('some_random_event')
      expect(event.user_profile_id).to eq(existing_user.id)
      expect(event.user_properties['first_name']).to eq('Jenny')
      expect(event.user_properties['last_name']).to eq('Rosen')
      expect(event.user_properties['birthday']).to eq('11/07/1992')
      expect(event.user_properties['email']).to eq('jenny@swishjam.com')
      expect(event.user_properties['unique_identifier']).to eq('xyz')
      expect(event.sanitized_properties['a_property']).to eq('a_value')
      expect(event.sanitized_properties.keys.count).to be(1)
    end

    it 'associate an existing user profile if the event payload provides a user_id and we already have a user profile for it' do
      existing_user = FactoryBot.create(:analytics_user_profile,
        workspace: @workspace,
        user_unique_identifier: 'xyz',
        email: 'jenny@swishjam.com',
        metadata: {
          first_name: 'Jenny',
          last_name: 'Rosen',
          birthday: '11/07/1992'
        }
      )

      event = Ingestion::EventPreparers::BasicEventHandler.new(
        parsed_event(
          swishjam_api_key: @public_key,
          properties: {
            a_property: 'a_value',
            user_id: existing_user.user_unique_identifier,
            user: {
              a_new_property: 'a_new_value',
              last_name: 'Overwritten',
            }
          }
        )
      ).handle_and_return_prepared_events!

      expect(@workspace.analytics_user_profiles.count).to be(1)
      expect(@workspace.analytics_user_profile_devices.count).to be(0)

      expect(@workspace.analytics_user_profiles.first.user_unique_identifier).to eq('xyz')
      expect(@workspace.analytics_user_profiles.first.email).to eq('jenny@swishjam.com')
      expect(@workspace.analytics_user_profiles.first.metadata['first_name']).to eq('Jenny')
      expect(@workspace.analytics_user_profiles.first.metadata['last_name']).to eq('Overwritten')
      expect(@workspace.analytics_user_profiles.first.metadata['birthday']).to eq('11/07/1992')
      expect(@workspace.analytics_user_profiles.first.metadata['a_new_property']).to eq('a_new_value')

      expect(event.uuid).to eq('evt-123')
      expect(event.swishjam_api_key).to eq(@public_key)
      expect(event.name).to eq('some_random_event')
      expect(event.user_profile_id).to eq(existing_user.id)
      expect(event.user_properties['first_name']).to eq('Jenny')
      expect(event.user_properties['last_name']).to eq('Overwritten')
      expect(event.user_properties['birthday']).to eq('11/07/1992')
      expect(event.user_properties['email']).to eq('jenny@swishjam.com')
      expect(event.user_properties['unique_identifier']).to eq('xyz')
      expect(event.user_properties['a_new_property']).to eq('a_new_value')
      expect(event.sanitized_properties['a_property']).to eq('a_value')
      expect(event.sanitized_properties.keys.count).to be(1)
    end

    it 'associates an existing user profile if the event payload provides a userId property and we already have a user profile for it' do
      existing_user = FactoryBot.create(:analytics_user_profile,
        workspace: @workspace,
        user_unique_identifier: 'xyz',
        email: 'jenny@swishjam.com',
        metadata: {
          first_name: 'Jenny',
          last_name: 'Rosen',
          birthday: '11/07/1992'
        }
      )

      event = Ingestion::EventPreparers::BasicEventHandler.new(
        parsed_event(
          swishjam_api_key: @public_key,
          properties: {
            a_property: 'a_value',
            userId: existing_user.user_unique_identifier,
            user: {
              a_new_property: 'a_new_value',
              last_name: 'Overwritten',
            }
          }
        )
      ).handle_and_return_prepared_events!

      expect(@workspace.analytics_user_profiles.count).to be(1)
      expect(@workspace.analytics_user_profile_devices.count).to be(0)

      expect(@workspace.analytics_user_profiles.first.user_unique_identifier).to eq('xyz')
      expect(@workspace.analytics_user_profiles.first.email).to eq('jenny@swishjam.com')
      expect(@workspace.analytics_user_profiles.first.metadata['first_name']).to eq('Jenny')
      expect(@workspace.analytics_user_profiles.first.metadata['last_name']).to eq('Overwritten')
      expect(@workspace.analytics_user_profiles.first.metadata['birthday']).to eq('11/07/1992')
      expect(@workspace.analytics_user_profiles.first.metadata['a_new_property']).to eq('a_new_value')

      expect(event.uuid).to eq('evt-123')
      expect(event.swishjam_api_key).to eq(@public_key)
      expect(event.name).to eq('some_random_event')
      expect(event.user_profile_id).to eq(existing_user.id)
      expect(event.user_properties['first_name']).to eq('Jenny')
      expect(event.user_properties['last_name']).to eq('Overwritten')
      expect(event.user_properties['birthday']).to eq('11/07/1992')
      expect(event.user_properties['email']).to eq('jenny@swishjam.com')
      expect(event.user_properties['unique_identifier']).to eq('xyz')
      expect(event.user_properties['a_new_property']).to eq('a_new_value')
      expect(event.sanitized_properties['a_property']).to eq('a_value')
      expect(event.sanitized_properties.keys.count).to be(1)
    end

    it 'associates an existing user profile if the event payload provides a user.id property and we already have a user profile for it' do
      existing_user = FactoryBot.create(:analytics_user_profile,
        workspace: @workspace,
        user_unique_identifier: 'xyz',
        email: 'jenny@swishjam.com',
        metadata: {
          first_name: 'Jenny',
          last_name: 'Rosen',
          birthday: '11/07/1992'
        }
      )

      event = Ingestion::EventPreparers::BasicEventHandler.new(
        parsed_event(
          swishjam_api_key: @public_key,
          properties: {
            a_property: 'a_value',
            user: {
              id: existing_user.user_unique_identifier,
              a_new_property: 'a_new_value',
              last_name: 'Overwritten',
            }
          }
        )
      ).handle_and_return_prepared_events!

      expect(@workspace.analytics_user_profiles.count).to be(1)
      expect(@workspace.analytics_user_profile_devices.count).to be(0)

      expect(@workspace.analytics_user_profiles.first.user_unique_identifier).to eq('xyz')
      expect(@workspace.analytics_user_profiles.first.email).to eq('jenny@swishjam.com')
      expect(@workspace.analytics_user_profiles.first.metadata['first_name']).to eq('Jenny')
      expect(@workspace.analytics_user_profiles.first.metadata['last_name']).to eq('Overwritten')
      expect(@workspace.analytics_user_profiles.first.metadata['birthday']).to eq('11/07/1992')
      expect(@workspace.analytics_user_profiles.first.metadata['a_new_property']).to eq('a_new_value')

      expect(event.uuid).to eq('evt-123')
      expect(event.swishjam_api_key).to eq(@public_key)
      expect(event.name).to eq('some_random_event')
      expect(event.user_profile_id).to eq(existing_user.id)
      expect(event.user_properties['first_name']).to eq('Jenny')
      expect(event.user_properties['last_name']).to eq('Overwritten')
      expect(event.user_properties['birthday']).to eq('11/07/1992')
      expect(event.user_properties['email']).to eq('jenny@swishjam.com')
      expect(event.user_properties['unique_identifier']).to eq('xyz')
      expect(event.user_properties['a_new_property']).to eq('a_new_value')
      expect(event.sanitized_properties['a_property']).to eq('a_value')
      expect(event.sanitized_properties.keys.count).to be(1)
    end

    it 'creates a new user profile if the event payload provides a userId and we do not already have a user profile for it' do
      other_user = FactoryBot.create(:analytics_user_profile,
        workspace: @workspace,
        user_unique_identifier: 'a-different-user-id',
        email: 'jenny@swishjam.com',
        metadata: {
          first_name: 'Jenny',
          last_name: 'Rosen',
          birthday: '11/07/1992'
        }
      )

      event = Ingestion::EventPreparers::BasicEventHandler.new(
        parsed_event(
          swishjam_api_key: @public_key,
          properties: {
            a_property: 'a_value',
            userId: 'a-new-user-id',
            user: {
              email: 'new-user@swishjam.com',
              first_name: 'Johnny',
            }
          }
        )
      ).handle_and_return_prepared_events!

      expect(@workspace.analytics_user_profiles.count).to be(2)
      expect(@workspace.analytics_user_profile_devices.count).to be(0)

      new_user = @workspace.analytics_user_profiles.find_by(user_unique_identifier: 'a-new-user-id')
      expect(new_user.email).to eq('new-user@swishjam.com')
      expect(new_user.metadata['first_name']).to eq('Johnny')

      expect(event.uuid).to eq('evt-123')
      expect(event.swishjam_api_key).to eq(@public_key)
      expect(event.name).to eq('some_random_event')
      expect(event.user_profile_id).to eq(new_user.id)
      expect(event.user_properties['first_name']).to eq('Johnny')
      expect(event.user_properties['email']).to eq('new-user@swishjam.com')
      expect(event.user_properties['unique_identifier']).to eq('a-new-user-id')
      expect(event.sanitized_properties['a_property']).to eq('a_value')
      expect(event.sanitized_properties.keys.count).to be(1)
    end
  end
end