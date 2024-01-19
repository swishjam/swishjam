require 'spec_helper'

describe Ingestion::UserIdentifyHandler do
  def identify_event_json(swishjam_api_key:, timestamp: 10.minutes.ago, properties: {})
    {
      'uuid' => 'evt-123',
      'swishjam_api_key' => swishjam_api_key,
      'name' => 'identify',
      'timestamp' => timestamp,
      'properties' => {
        'device_fingerprint' => 'abc',
        'device_identifier' => '123',
        'userIdentifier' => 'my-user-unique-identifier',
        'email' => 'jenny@swishjam.com',
        'first_name' => 'Jenny',
        'last_name' => 'Rosen',
        'phone_number' => '1234567890',
        # I think technically this would also be in the payload, but we don't actually use any of it for the identify logic
        'user_attributes' => {
          'unique_identifier' => '123',
          'email' => 'jenny@swishjam.com',
          'first_name' => 'Jenny',
          'last_name' => 'Swishjam',
          'phone_number' => '1234567890',
        },
      }.merge(properties),
    }
  end

  describe '#handle_identify_and_return_new_event!' do
    it 'creates a new device and user profile if the device is new' do
      workspace = FactoryBot.create(:workspace)
      public_key = workspace.api_keys.for_data_source!('product').public_key
      timestamp = 10.minutes.ago
      event = Ingestion::ParsedEventFromIngestion.new(identify_event_json(swishjam_api_key: public_key, timestamp: timestamp))

      expect(workspace.analytics_user_profiles.count).to eq(0)
      expect(workspace.analytics_user_profile_devices.count).to eq(0)
      
      described_class.new(event).handle_identify_and_update_event!
      
      expect(workspace.analytics_user_profiles.count).to eq(1)
      expect(workspace.analytics_user_profile_devices.count).to eq(1)

      expect(workspace.analytics_user_profiles.first.user_unique_identifier).to eq('my-user-unique-identifier')
      expect(workspace.analytics_user_profiles.first.email).to eq('jenny@swishjam.com')
      expect(workspace.analytics_user_profiles.first.metadata['first_name']).to eq('Jenny')
      expect(workspace.analytics_user_profiles.first.metadata['last_name']).to eq('Rosen')
      expect(workspace.analytics_user_profiles.first.metadata['phone_number']).to eq('1234567890')

      expect(workspace.analytics_user_profile_devices.first.device_fingerprint).to eq('abc')
      expect(workspace.analytics_user_profile_devices.first.swishjam_cookie_value).to eq('123')
      
      expect(event.uuid).to eq('evt-123')
      expect(event.swishjam_api_key).to eq(public_key)
      expect(event.name).to eq('identify')
      expect(event.user_profile_id).to eq(workspace.analytics_user_profiles.first.id)
      expect(event.timestamp).to eq(timestamp)
      expect(event.occurred_at).to eq(timestamp)

      expect(event.properties['userIdentifier']).to eq('my-user-unique-identifier')
      expect(event.properties['email']).to eq('jenny@swishjam.com')
      expect(event.properties['first_name']).to eq('Jenny')
      expect(event.properties['last_name']).to eq('Rosen')
      expect(event.properties['phone_number']).to eq('1234567890')
      expect(event.properties.keys.count).to eq(5)

      expect(event.user_properties['email']).to eq('jenny@swishjam.com')
      expect(event.user_properties['first_name']).to eq('Jenny')
      expect(event.user_properties['last_name']).to eq('Rosen')
      expect(event.user_properties['phone_number']).to eq('1234567890')
      expect(event.user_properties['unique_identifier']).to eq('my-user-unique-identifier')
      expect(event.user_properties.keys.count).to eq(5)
    end

    it 'creates a new device and assigns it to an existing user profile if the device is new but the provided user identifier has an existing profile' do
      workspace = FactoryBot.create(:workspace)
      public_key = workspace.api_keys.for_data_source!('product').public_key
      timestamp = 10.minutes.ago
      existing_user_profile = FactoryBot.create(:analytics_user_profile, 
        workspace: workspace,
        user_unique_identifier: 'my-user-unique-identifier', 
        email: 'an-email-that-will-be-overwritten@gmail.com',
        metadata: {
          first_name: 'Overwrite me!',
          some_pre_existing_key_that_doesnt_get_overwritten: 'foo!',
        }
      )

      event_json = identify_event_json(
        swishjam_api_key: public_key, 
        timestamp: timestamp, 
        properties: {
          email: 'yo@swishjam.com',
          first_name: 'Yo',
          last_name: 'Dawg',
          phone_number: '0987654321',
          subscription_plan: 'pro',
        }
      )
      event = Ingestion::ParsedEventFromIngestion.new(event_json)

      expect(workspace.analytics_user_profiles.count).to eq(1)
      expect(workspace.analytics_user_profile_devices.count).to eq(0)
      
      described_class.new(event).handle_identify_and_update_event!
      
      expect(workspace.analytics_user_profiles.count).to eq(1)
      expect(workspace.analytics_user_profile_devices.count).to eq(1)

      expect(workspace.analytics_user_profiles.first.user_unique_identifier).to eq('my-user-unique-identifier')
      expect(workspace.analytics_user_profiles.first.email).to eq('yo@swishjam.com')
      expect(workspace.analytics_user_profiles.first.metadata['first_name']).to eq('Yo')
      expect(workspace.analytics_user_profiles.first.metadata['last_name']).to eq('Dawg')
      expect(workspace.analytics_user_profiles.first.metadata['phone_number']).to eq('0987654321')
      expect(workspace.analytics_user_profiles.first.metadata['subscription_plan']).to eq('pro')

      expect(workspace.analytics_user_profile_devices.first.device_fingerprint).to eq('abc')
      expect(workspace.analytics_user_profile_devices.first.swishjam_cookie_value).to eq('123')
      expect(workspace.analytics_user_profile_devices.first.analytics_user_profile_id).to eq(workspace.analytics_user_profiles.first.id)
      
      expect(event.uuid).to eq('evt-123')
      expect(event.swishjam_api_key).to eq(public_key)
      expect(event.name).to eq('identify')
      expect(event.user_profile_id).to eq(workspace.analytics_user_profiles.first.id)

      expect(event.properties['userIdentifier']).to eq('my-user-unique-identifier')
      expect(event.properties['email']).to eq('yo@swishjam.com')
      expect(event.properties['first_name']).to eq('Yo')
      expect(event.properties['last_name']).to eq('Dawg')
      expect(event.properties['phone_number']).to eq('0987654321')
      expect(event.properties['subscription_plan']).to eq('pro')
      expect(event.properties.keys.count).to eq(6)

      expect(event.user_properties['unique_identifier']).to eq('my-user-unique-identifier')
      expect(event.user_properties['email']).to eq('yo@swishjam.com')
      expect(event.user_properties['first_name']).to eq('Yo')
      expect(event.user_properties['last_name']).to eq('Dawg')
      expect(event.user_properties['phone_number']).to eq('0987654321')
      expect(event.user_properties['subscription_plan']).to eq('pro')
      expect(event.user_properties.keys.count).to eq(6)
    end

    it 'only updates the user profile if its an existing device that already belongs to the provided unique user identifier' do
      workspace = FactoryBot.create(:workspace)
      public_key = workspace.api_keys.for_data_source!('product').public_key
      timestamp = 10.minutes.ago
      existing_user_profile = FactoryBot.create(:analytics_user_profile, 
        workspace: workspace,
        user_unique_identifier: 'my-user-unique-identifier', 
        email: 'an-email-that-will-be-overwritten@gmail.com',
        metadata: {
          first_name: 'Overwrite me!',
          some_pre_existing_key_that_doesnt_get_overwritten: 'foo!',
        }
      )

      existing_device = FactoryBot.create(:analytics_user_profile_device,
        workspace: workspace,
        analytics_user_profile: existing_user_profile,
        swishjam_cookie_value: 'abc',
        device_fingerprint: '123',
      )

      event_json = identify_event_json(
        swishjam_api_key: public_key, 
        timestamp: timestamp, 
        properties: {
          device_identifier: existing_device.swishjam_cookie_value,
          email: 'yo@swishjam.com',
          first_name: 'Yo',
          last_name: 'Dawg',
          phone_number: '0987654321',
          subscription_plan: 'pro',
        }
      )
      event = Ingestion::ParsedEventFromIngestion.new(event_json)

      expect(workspace.analytics_user_profiles.count).to eq(1)
      expect(workspace.analytics_user_profile_devices.count).to eq(1)
      
      described_class.new(event).handle_identify_and_update_event!
      
      expect(workspace.analytics_user_profiles.count).to eq(1)
      expect(workspace.analytics_user_profile_devices.count).to eq(1)

      expect(workspace.analytics_user_profiles.first.user_unique_identifier).to eq('my-user-unique-identifier')
      expect(workspace.analytics_user_profiles.first.email).to eq('yo@swishjam.com')
      expect(workspace.analytics_user_profiles.first.metadata['first_name']).to eq('Yo')
      expect(workspace.analytics_user_profiles.first.metadata['last_name']).to eq('Dawg')
      expect(workspace.analytics_user_profiles.first.metadata['phone_number']).to eq('0987654321')
      expect(workspace.analytics_user_profiles.first.metadata['subscription_plan']).to eq('pro')
      expect(workspace.analytics_user_profiles.first.metadata['some_pre_existing_key_that_doesnt_get_overwritten']).to eq('foo!')

      expect(workspace.analytics_user_profile_devices.first.device_fingerprint).to eq('123')
      expect(workspace.analytics_user_profile_devices.first.swishjam_cookie_value).to eq('abc')
      expect(workspace.analytics_user_profile_devices.first.analytics_user_profile_id).to eq(workspace.analytics_user_profiles.first.id)
      
      expect(event.uuid).to eq('evt-123')
      expect(event.swishjam_api_key).to eq(public_key)
      expect(event.name).to eq('identify')
      expect(event.user_profile_id).to eq(workspace.analytics_user_profiles.first.id)

      expect(event.properties['userIdentifier']).to eq('my-user-unique-identifier')
      expect(event.properties['email']).to eq('yo@swishjam.com')
      expect(event.properties['first_name']).to eq('Yo')
      expect(event.properties['last_name']).to eq('Dawg')
      expect(event.properties['phone_number']).to eq('0987654321')
      expect(event.properties['subscription_plan']).to eq('pro')
      expect(event.properties.keys.count).to eq(6)

      expect(event.user_properties['unique_identifier']).to eq('my-user-unique-identifier')
      expect(event.user_properties['email']).to eq('yo@swishjam.com')
      expect(event.user_properties['first_name']).to eq('Yo')
      expect(event.user_properties['last_name']).to eq('Dawg')
      expect(event.user_properties['phone_number']).to eq('0987654321')
      expect(event.user_properties['subscription_plan']).to eq('pro')
      expect(event.user_properties['some_pre_existing_key_that_doesnt_get_overwritten']).to eq('foo!')
      expect(event.user_properties.keys.count).to eq(7)
    end

    it 're-assigns the device to a new user if the device already exists and it\'s unique identifier is different than it\'s current owner' do
      workspace = FactoryBot.create(:workspace)
      public_key = workspace.api_keys.for_data_source!('product').public_key
      timestamp = 10.minutes.ago
      previous_owner = FactoryBot.create(:analytics_user_profile, 
        workspace: workspace,
        user_unique_identifier: 'a-different-unique-identifier-than-the-identify-payload', 
        email: 'doesnt-matter-not-my-device-anymore@gmail.com',
      )

      existing_device = FactoryBot.create(:analytics_user_profile_device,
        workspace: workspace,
        analytics_user_profile: previous_owner,
        swishjam_cookie_value: 'abc',
        device_fingerprint: '123',
      )

      event_json = identify_event_json(
        swishjam_api_key: public_key, 
        timestamp: timestamp, 
        properties: {
          device_identifier: existing_device.swishjam_cookie_value,
          userIdentifier: 'a-new-user-unique-identifier',
          email: 'yo@swishjam.com',
          first_name: 'Yo',
          last_name: 'Dawg',
          phone_number: '0987654321',
          subscription_plan: 'pro',
        }
      )
      event = Ingestion::ParsedEventFromIngestion.new(event_json)

      expect(workspace.analytics_user_profiles.count).to eq(1)
      expect(workspace.analytics_user_profile_devices.count).to eq(1)
      
      described_class.new(event).handle_identify_and_update_event!
      
      expect(workspace.analytics_user_profiles.count).to eq(2)
      expect(workspace.analytics_user_profile_devices.count).to eq(1)

      new_user_profile = workspace.analytics_user_profiles.find_by(user_unique_identifier: 'a-new-user-unique-identifier')
      expect(new_user_profile.user_unique_identifier).to eq('my-user-unique-identifier')
      expect(new_user_profile.email).to eq('yo@swishjam.com')
      expect(new_user_profile.metadata['first_name']).to eq('Yo')
      expect(new_user_profile.metadata['last_name']).to eq('Dawg')
      expect(new_user_profile.metadata['phone_number']).to eq('0987654321')
      expect(new_user_profile.metadata['subscription_plan']).to eq('pro')

      expect(workspace.analytics_user_profile_devices.first.device_fingerprint).to eq('123')
      expect(workspace.analytics_user_profile_devices.first.swishjam_cookie_value).to eq('abc')
      expect(workspace.analytics_user_profile_devices.first.analytics_user_profile_id).to eq(new_user_profile.id)
      
      expect(event.uuid).to eq('evt-123')
      expect(event.swishjam_api_key).to eq(public_key)
      expect(event.name).to eq('identify')
      expect(event.user_profile_id).to eq(workspace.analytics_user_profiles.first.id)

      expect(event.properties['userIdentifier']).to eq('a-new-user-unique-identifier')
      expect(event.properties['email']).to eq('yo@swishjam.com')
      expect(event.properties['first_name']).to eq('Yo')
      expect(event.properties['last_name']).to eq('Dawg')
      expect(event.properties['phone_number']).to eq('0987654321')
      expect(event.properties['subscription_plan']).to eq('pro')
      expect(event.properties.keys.count).to eq(6)

      expect(event.user_properties['unique_identifier']).to eq('a-new-user-unique-identifier')
      expect(event.user_properties['email']).to eq('yo@swishjam.com')
      expect(event.user_properties['first_name']).to eq('Yo')
      expect(event.user_properties['last_name']).to eq('Dawg')
      expect(event.user_properties['phone_number']).to eq('0987654321')
      expect(event.user_properties['subscription_plan']).to eq('pro')
      expect(event.user_properties.keys.count).to eq(6)
    end
  end
end