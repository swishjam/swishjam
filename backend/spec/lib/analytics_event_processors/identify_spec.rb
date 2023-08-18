require 'spec_helper'

describe AnalyticsEventProcessors::Identify do
  before do
    @swishjam_organization = FactoryBot.create(:swishjam_organization)
    @event_payload_device_fingerprint = "unique-device-fingerprint"
    @event_payload_user_id = 'user-provided-unique-id'
    @identify_event_payload = {
      'type' => 'identify',
      'sessionId' => 'swishjam-generated-session-id',
      'pageViewId' => 'swishjam-generated-page-view-id',
      'timestamp' => 1.minute.ago,
      'url' => 'http://www.waffleshop.com',
      'deviceData' => {
        'fingerprint' => @event_payload_device_fingerprint,
        'userAgent' => 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
        'browser' => 'Chrome',
        'browserVersion' => '1.0',
        'os' => 'Max OS X',
        'osVersion' => '5.0',
      },
      'data' => {
        'userId' => @event_payload_user_id,
        'email' => 'hello@example.com',
        'firstName' => 'John',
        'lastName' => 'Doe',
        'birthday' => '1980-01-01',
      }
    }
  end

  describe '#process!' do    
    it 'creates a new user if one does not yet exist for the provided `unique_identifier`' do
      expect(@swishjam_organization.analytics_users.count).to be(0)
      AnalyticsEventProcessors::Identify.new(@swishjam_organization.public_key, @identify_event_payload).process!
      new_user = @swishjam_organization.analytics_users.last

      expect(@swishjam_organization.analytics_users.count).to be(1)
      expect(new_user.unique_identifier).to eq(@event_payload_user_id)
      expect(new_user.email).to eq('hello@example.com')
      expect(new_user.first_name).to eq('John')
      expect(new_user.last_name).to eq('Doe')
      expect(new_user.metadata.count).to be(2)
      expect(new_user.metadata.formatted['birthday']).to eq('1980-01-01')
    end

    it 'updates an existing user if one already exists for the provided `unique_identifier`' do
      existing_user = FactoryBot.create(:analytics_user, 
        swishjam_organization: @swishjam_organization, 
        unique_identifier: @event_payload_user_id, 
        email: 'original-email@example.com',
        first_name: 'Harry',
        last_name: 'Potter',
      )
      FactoryBot.create(:user_metadata, parent: existing_user, key: 'birthday', value: '1992-11-07')
      expect(@swishjam_organization.analytics_users.count).to be(1)
      AnalyticsEventProcessors::Identify.new(@swishjam_organization.public_key, @identify_event_payload).process!
      existing_user.reload
      expect(@swishjam_organization.analytics_users.count).to be(1)
      expect(existing_user.unique_identifier).to eq(@event_payload_user_id)
      expect(existing_user.email).to eq('hello@example.com')
      expect(existing_user.first_name).to eq('John')
      expect(existing_user.last_name).to eq('Doe')
      expect(existing_user.metadata.count).to be(1)
      expect(existing_user.metadata.formatted['birthday']).to eq('1980-01-01')
    end

    it 'updates an existing user if it is unable to find the user by the provided `unique_identifier` but it is able to find the user by the provided `email`' do
      existing_user = FactoryBot.create(:analytics_user, 
        swishjam_organization: @swishjam_organization, 
        unique_identifier: nil, 
        email: 'hello@example.com'
      )
      expect(@swishjam_organization.analytics_users.count).to be(1)
      AnalyticsEventProcessors::Identify.new(@swishjam_organization.public_key, @identify_event_payload).process!
      existing_user.reload
      expect(@swishjam_organization.analytics_users.count).to be(1)
      expect(@swishjam_organization.analytics_users.last).to eq(existing_user)
      expect(existing_user.unique_identifier).to eq(@event_payload_user_id)
      expect(existing_user.email).to eq('hello@example.com')
      expect(existing_user.first_name).to eq('John')
      expect(existing_user.last_name).to eq('Doe')
      expect(existing_user.metadata.count).to be(1)
      expect(existing_user.metadata.formatted['birthday']).to eq('1980-01-01')
    end

    it 'updates an existing user if it is unable to find the user by the provided `unique_identifier` but it is able to find the user by the provided full name' do
      existing_user = FactoryBot.create(:analytics_user, 
        swishjam_organization: @swishjam_organization, 
        unique_identifier: nil, 
        email: 'something-different@example.com',
        first_name: 'John',
        last_name: 'Doe',
      )
      expect(@swishjam_organization.analytics_users.count).to be(1)
      AnalyticsEventProcessors::Identify.new(@swishjam_organization.public_key, @identify_event_payload).process!
      existing_user.reload
      expect(@swishjam_organization.analytics_users.count).to be(1)
      expect(@swishjam_organization.analytics_users.last).to eq(existing_user)
      expect(existing_user.unique_identifier).to eq(@event_payload_user_id)
      expect(existing_user.email).to eq('hello@example.com')
      expect(existing_user.first_name).to eq('John')
      expect(existing_user.last_name).to eq('Doe')
      expect(existing_user.metadata.count).to be(1)
      expect(existing_user.metadata.formatted['birthday']).to eq('1980-01-01')
    end

    it 'also excepts underscored attributes for `userId`, `firstName`, and `lastName`' do
      @identify_event_payload['data']['user_id'] = @identify_event_payload['data']['userId']
      @identify_event_payload['data'].delete('userId')
      @identify_event_payload['data']['first_name'] = @identify_event_payload['data']['firstName']
      @identify_event_payload['data'].delete('firstName')
      @identify_event_payload['data']['last_name'] = @identify_event_payload['data']['lastName']
      @identify_event_payload['data'].delete('lastName')
      
      expect(@swishjam_organization.analytics_users.count).to be(0)
      AnalyticsEventProcessors::Identify.new(@swishjam_organization.public_key, @identify_event_payload).process!
      new_user = @swishjam_organization.analytics_users.last

      expect(@swishjam_organization.analytics_users.count).to be(1)
      expect(new_user.unique_identifier).to eq(@event_payload_user_id)
      expect(new_user.email).to eq('hello@example.com')
      expect(new_user.first_name).to eq('John')
      expect(new_user.last_name).to eq('Doe')
      expect(new_user.metadata.count).to be(2)
      expect(new_user.metadata.formatted['birthday']).to eq('1980-01-01')
    end

    it 'creates a new device if one does not yet exist for the provided `fingerprint`' do
      expect(@swishjam_organization.analytics_devices.count).to be(0)
      AnalyticsEventProcessors::Identify.new(@swishjam_organization.public_key, @identify_event_payload).process!
      new_device = @swishjam_organization.analytics_devices.last

      expect(@swishjam_organization.analytics_devices.count).to be(1)
      expect(new_device.fingerprint).to eq(@event_payload_device_fingerprint)
      expect(new_device.user_agent).to eq('Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36')
      expect(new_device.browser).to eq('Chrome')
      expect(new_device.browser_version).to eq('1.0')
      expect(new_device.os).to eq('Max OS X')
      expect(new_device.os_version).to eq('5.0')
      expect(new_device.user).to eq(@swishjam_organization.analytics_users.last)
    end

    it 'leaves the existing device in place if it already exists for the provided `fingerprint` and it belongs to the same user' do
      existing_user = FactoryBot.create(:analytics_user, swishjam_organization: @swishjam_organization, unique_identifier: @event_payload_user_id)
      existing_device = FactoryBot.create(:analytics_device,
        swishjam_organization: @swishjam_organization, 
        user: existing_user, 
        fingerprint: @event_payload_device_fingerprint
      )
      expect(@swishjam_organization.analytics_devices.count).to be(1)
      AnalyticsEventProcessors::Identify.new(@swishjam_organization.public_key, @identify_event_payload).process!
      expect(@swishjam_organization.analytics_devices.count).to be(1)
      expect(@swishjam_organization.analytics_devices.last).to eq(existing_device)
      expect(@swishjam_organization.analytics_devices.last.user).to eq(existing_user)
    end

    it 'updates an existing device if one already exists for the provided `fingerprint` and it belongs to a different user' do
      separate_user = FactoryBot.create(:analytics_user, 
        swishjam_organization: @swishjam_organization, 
        unique_identifier: 'a-different-unique-id',
        email: 'johnny@appleseed.com',
        first_name: 'Johnny',
        last_name: 'Appleseed',
      )
      existing_device = FactoryBot.create(:analytics_device,
        swishjam_organization: @swishjam_organization, 
        user: separate_user, 
        fingerprint: @event_payload_device_fingerprint
      )
      expect(@swishjam_organization.analytics_devices.count).to be(1)
      AnalyticsEventProcessors::Identify.new(@swishjam_organization.public_key, @identify_event_payload).process!
      expect(@swishjam_organization.analytics_devices.count).to be(1)
      expect(@swishjam_organization.analytics_users.count).to be(2)

      new_user = @swishjam_organization.analytics_users.where.not(id: separate_user.id).first
      expect(existing_device.reload.user).to eq(new_user)
    end
  end
end