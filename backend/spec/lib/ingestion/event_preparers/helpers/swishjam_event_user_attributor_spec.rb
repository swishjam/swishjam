require 'spec_helper'

describe Ingestion::EventPreparers::Helpers::SwishjamEventUserAttributor do
  def parsed_event(swishjam_api_key:, name: 'some_random_event', timestamp: 10.minutes.ago, properties: {}, device_identifier: '123')
    Ingestion::ParsedEventFromIngestion.new({
      'uuid' => 'evt-123',
      'swishjam_api_key' => swishjam_api_key,
      'name' => name,
      'occurred_at' => timestamp.to_f,
      'properties' => {
        'device_fingerprint' => 'abc',
        'device_identifier' => device_identifier,
      }.merge(properties),
    })
  end

  before do
    @workspace = FactoryBot.create(:workspace)
    @public_key = @workspace.api_keys.for_data_source!('product').public_key
  end

  describe '#get_user_profile_and_associate_to_device_if_necessary!' do
    it 'returns nil if the event doesnt have a device_identifier and doesnt any user data' do
      user = described_class.new(
        parsed_event(swishjam_api_key: @public_key, properties: { device_identifier: nil })
      ).get_user_profile_and_associate_to_device_if_necessary!

      expect(user).to be(nil)
      expect(@workspace.analytics_user_profiles.count).to be(0)
      expect(@workspace.analytics_user_profile_devices.count).to be(0)
    end

    it 'updates and returns the user profile when the unique identifier is provided as { user: { id }} in the event properties and the user exists' do
      user_profile = FactoryBot.create(:analytics_user_profile, workspace: @workspace, user_unique_identifier: '123', email: 'old@email.com', metadata: { 'key_should_be_overwritten' => 'old_value', 'key_should_remain' => 'unchanged' })
      user = described_class.new(
        parsed_event(swishjam_api_key: @public_key, properties: { user: { id: '123', email: 'new@email.com', 'key_should_be_overwritten' => 'new_value' }})
      ).get_user_profile_and_associate_to_device_if_necessary!

      expect(@workspace.analytics_user_profiles.count).to be(1)
      expect(@workspace.analytics_user_profile_devices.count).to be(1)
      expect(user.email).to eq('new@email.com')
      expect(user.user_unique_identifier).to eq('123')
      expect(user.metadata['key_should_be_overwritten']).to eq('new_value')
      expect(user.metadata['key_should_remain']).to eq('unchanged')

      user_profile.reload
      expect(user_profile.email).to eq('new@email.com')
      expect(user_profile.user_unique_identifier).to eq('123')
      expect(user_profile.metadata['key_should_be_overwritten']).to eq('new_value')
      expect(user_profile.metadata['key_should_remain']).to eq('unchanged')
      expect(user_profile.metadata.keys.count).to eq(2)
    end

    it 'updates and returns the user profile when the unique identifier is provided as { user_attributes: { unique_identifier }} in the event properties and the user exists' do
      user_profile = FactoryBot.create(:analytics_user_profile, workspace: @workspace, user_unique_identifier: '123', email: 'old@email.com', metadata: { 'key_should_be_overwritten' => 'old_value', 'key_should_remain' => 'unchanged' })
      user = described_class.new(
        parsed_event(swishjam_api_key: @public_key, properties: { user_attributes: { unique_identifier: '123', email: 'new@email.com', 'key_should_be_overwritten' => 'new_value' }})
      ).get_user_profile_and_associate_to_device_if_necessary!

      expect(@workspace.analytics_user_profiles.count).to be(1)
      expect(@workspace.analytics_user_profile_devices.count).to be(1)
      expect(user.email).to eq('new@email.com')
      expect(user.user_unique_identifier).to eq('123')
      expect(user.metadata['key_should_be_overwritten']).to eq('new_value')
      expect(user.metadata['key_should_remain']).to eq('unchanged')

      user_profile.reload
      expect(user_profile.email).to eq('new@email.com')
      expect(user_profile.user_unique_identifier).to eq('123')
      expect(user_profile.metadata['key_should_be_overwritten']).to eq('new_value')
      expect(user_profile.metadata['key_should_remain']).to eq('unchanged')
      expect(user_profile.metadata.keys.count).to eq(2)
    end


    it 'updates and returns the user profile when the unique identifier is provided as `user_id` in the event properties and the user exists' do
      user_profile = FactoryBot.create(:analytics_user_profile, workspace: @workspace, user_unique_identifier: '123', email: 'old@email.com', metadata: { 'key_should_be_overwritten' => 'old_value', 'key_should_remain' => 'unchanged' })
      user = described_class.new(
        parsed_event(swishjam_api_key: @public_key, name: 'identify', properties: { user_id: '123', email: 'new@email.com', key_should_be_overwritten: 'new_value' })
      ).get_user_profile_and_associate_to_device_if_necessary!

      expect(@workspace.analytics_user_profiles.count).to be(1)
      expect(@workspace.analytics_user_profile_devices.count).to be(1)
      expect(user.email).to eq('new@email.com')
      expect(user.user_unique_identifier).to eq('123')
      expect(user.metadata['key_should_be_overwritten']).to eq('new_value')
      expect(user.metadata['key_should_remain']).to eq('unchanged')

      user_profile.reload
      expect(user_profile.email).to eq('new@email.com')
      expect(user_profile.user_unique_identifier).to eq('123')
      expect(user_profile.metadata['key_should_be_overwritten']).to eq('new_value')
      expect(user_profile.metadata['key_should_remain']).to eq('unchanged')
      expect(user_profile.metadata.keys.count).to eq(2)
    end

    it 'updates and returns the user profile when a user does not exist with the provided unique identifier, but there is an existing with the same email who doesnt have a unique identifier' do
      user_profile = FactoryBot.create(:analytics_user_profile, workspace: @workspace, user_unique_identifier: nil, email: 'existing@email.com', metadata: { my_key: 'my value' })
      user = described_class.new(
        parsed_event(swishjam_api_key: @public_key, properties: { user: { id: '123', email: 'existing@email.com' }})
      ).get_user_profile_and_associate_to_device_if_necessary!

      expect(@workspace.analytics_user_profiles.count).to be(1)
      expect(@workspace.analytics_user_profile_devices.count).to be(1)
      expect(user.email).to eq('existing@email.com')
      expect(user.user_unique_identifier).to eq('123')
      expect(user.metadata['my_key']).to eq('my value')

      user_profile.reload
      expect(user_profile.email).to eq('existing@email.com')
      expect(user_profile.user_unique_identifier).to eq('123')
      expect(user_profile.metadata['my_key']).to eq('my value')
      expect(user_profile.metadata.keys.count).to eq(1)
    end

    it 'creates a new user profile if there isnt a user with the provided unique identifier or email, and a new device if one does not exist with the provided `device_identifier`' do
      user = described_class.new(
        parsed_event(swishjam_api_key: @public_key, properties: { user: { id: '123', email: 'new@email.com', birthday: '11/07/1992' }})
      ).get_user_profile_and_associate_to_device_if_necessary!

      expect(@workspace.analytics_user_profiles.count).to be(1)
      expect(@workspace.analytics_user_profile_devices.count).to be(1)
      expect(user.email).to eq('new@email.com')
      expect(user.user_unique_identifier).to eq('123')
      expect(user.metadata['birthday']).to eq('11/07/1992')

      user_profile = @workspace.analytics_user_profiles.first
      expect(user_profile.email).to eq('new@email.com')
      expect(user_profile.user_unique_identifier).to eq('123')
      expect(user_profile.metadata['birthday']).to eq('11/07/1992')
      expect(user_profile.metadata.keys.count).to eq(1)
    end

    it 'uses the device owner as the user profile if the device exists and there was no unique identifier or email provided' do
      user_profile = FactoryBot.create(:analytics_user_profile, workspace: @workspace, user_unique_identifier: '123', email: 'existing@email.com', metadata: { birthday: '11/07/1992' })
      device = FactoryBot.create(:analytics_user_profile_device, workspace: @workspace, swishjam_cookie_value: 'd-xyz', analytics_user_profile: user_profile)
      user = described_class.new(
        parsed_event(swishjam_api_key: @public_key, device_identifier: 'd-xyz')
      ).get_user_profile_and_associate_to_device_if_necessary!

      expect(@workspace.analytics_user_profiles.count).to be(1)
      expect(@workspace.analytics_user_profile_devices.count).to be(1)
      expect(user.email).to eq('existing@email.com')
      expect(user.user_unique_identifier).to eq('123')
      expect(user.metadata['birthday']).to eq('11/07/1992')

      user_profile.reload
      expect(user_profile.email).to eq('existing@email.com')
      expect(user_profile.user_unique_identifier).to eq('123')
      expect(user_profile.metadata['birthday']).to eq('11/07/1992')
      expect(user_profile.metadata.keys.count).to eq(1)
    end

    it 'creates a new anonymous user if there was no unique identifier or email provided, and a device does not yet exist with the provided device_identifier' do
      user = described_class.new(
        parsed_event(swishjam_api_key: @public_key)
      ).get_user_profile_and_associate_to_device_if_necessary!

      expect(@workspace.analytics_user_profiles.count).to be(1)
      expect(@workspace.analytics_user_profile_devices.count).to be(1)
      expect(user.email).to be(nil)
      expect(user.user_unique_identifier).to be(nil)

      user_profile = @workspace.analytics_user_profiles.first
      expect(user_profile.email).to be(nil)
      expect(user_profile.user_unique_identifier).to be(nil)
      expect(user_profile.metadata.keys.count).to eq(0)
    end

    it 'merges the previous device owner with the user profile if the previous device owner was anonymous and the user already existed' do
      anonymous_user_profile = FactoryBot.create(:analytics_user_profile, 
        workspace: @workspace, 
        created_at: 2.day.ago, 
        user_unique_identifier: nil, 
        metadata: { 
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL => 'og-landing.com', 
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL => 'og-referrer.com' 
        }
      )
      device = FactoryBot.create(:analytics_user_profile_device, workspace: @workspace, swishjam_cookie_value: 'd-xyz', analytics_user_profile: anonymous_user_profile)
      existing_identified_user_profile = FactoryBot.create(:analytics_user_profile, 
        workspace: @workspace, 
        created_at: 1.day.ago, 
        user_unique_identifier: '123', 
        email: 'existing@email.com', 
        metadata: { 
          birthday: '11/07/1992', 
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL => 'landing-to-override.com', 
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL => 'referrer-to-override.com' 
        }
      )
      returned_user = described_class.new(
        parsed_event(
          swishjam_api_key: @public_key, 
          device_identifier: device.swishjam_cookie_value, 
          properties: { 
            Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL => 'should-get-overwritten-landing.com',
            Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_URL => 'should-get-overwritten-referrer.com',
            user: { 
              id: '123', 
              email: 'new@email.com', 
              birthday: '11/07/1992', 
            }
          }
        )
      ).get_user_profile_and_associate_to_device_if_necessary!

      expect(@workspace.analytics_user_profiles.count).to be(2)
      expect(@workspace.analytics_user_profile_devices.count).to be(1)

      expect(returned_user.id).to eq(existing_identified_user_profile.id)
      expect(returned_user.email).to eq('new@email.com')
      expect(returned_user.user_unique_identifier).to eq('123')
      expect(returned_user.metadata['birthday']).to eq('11/07/1992')
      expect(returned_user.metadata[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL]).to eq('og-landing.com')
      expect(returned_user.metadata[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL]).to eq('og-referrer.com')
      expect(returned_user.metadata.keys.count).to eq(3)

      anonymous_user_profile.reload
      expect(anonymous_user_profile.merged_into_analytics_user_profile_id).to eq(existing_identified_user_profile.id)
    end

    it 'creates a new user profile if just an email is provided and there are no matching users with that email' do
      existing_resend_user = FactoryBot.create(:analytics_user_profile, workspace: @workspace, user_unique_identifier: nil, email: 'resend@user.com')
      user = described_class.new(
        parsed_event(swishjam_api_key: @public_key, name: 'update_user', properties: { device_identifier: 'foo', user: { email: 'new@email.com' }})
      ).get_user_profile_and_associate_to_device_if_necessary!
      
      expect(@workspace.analytics_user_profiles.count).to be(2)
      expect(user.email).to eq('new@email.com')
      expect(user.user_unique_identifier).to be(nil)

      expect(existing_resend_user.reload.email).to eq('resend@user.com')
    end
  end
end
