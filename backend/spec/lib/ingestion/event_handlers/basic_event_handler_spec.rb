require 'spec_helper'

describe Ingestion::EventHandlers::BasicEventHandler do
  def parsed_event(swishjam_api_key:, name: 'some_random_event', timestamp: 10.minutes.ago, properties: {})
    Ingestion::ParsedEventFromIngestion.new({
      'uuid' => 'evt-123',
      'swishjam_api_key' => swishjam_api_key,
      'name' => name,
      'timestamp' => timestamp,
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

  describe '#handle_and_return_new_event_json!' do
    it 'creates a new device if the provided device_identifier does not exist and a new anonymous user profile if there is no user identifier provided' do
      expect(@workspace.analytics_user_profiles.count).to be(0)
      expect(@workspace.analytics_user_profile_devices.count).to be(0)
      
      event = Ingestion::EventHandlers::BasicEventHandler.new(
        parsed_event(
          swishjam_api_key: @public_key,
          properties: { a_property: 'a_value' }
        )
      ).handle_and_return_new_event_json!

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
      expect(event.properties['a_property']).to eq('a_value')
      expect(event.properties.keys.count).to be(1)
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
      
      event = Ingestion::EventHandlers::BasicEventHandler.new(
        parsed_event(
          swishjam_api_key: @public_key,
          properties: { 
            a_property: 'a_value',
            device_identifier: existing_device.swishjam_cookie_value
          }
        )
      ).handle_and_return_new_event_json!

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
      expect(event.properties['a_property']).to eq('a_value')
      expect(event.properties.keys.count).to be(1)
    end

    it 'associate an existing user profile if the event payload provides a user_id and we already have a user profile for it' do
      # TODO
    end

    it 'creates a new user profile if the event payload provides a user_id and we do not already have a user profile for it' do
      # TODO
    end
  end
end