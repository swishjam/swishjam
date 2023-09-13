require 'spec_helper'

describe AnalyticsEventProcessors::PageView do
  before do
    setup_test_data
    @device_fingerprint = "unique-device-fingerprint"
    @user_id = 'user-provided-unique-id'
    @organization_identifier = 'user-provided-organization-identifier'
    @page_view_identifier = 'user-provided-page-view-identifier'
    @session_identifier = 'swishjam-generated-session-identifier'
    @timestamp = 1.minute.ago.to_i * 1_000
    @page_view_event_payload = {
      'type' => 'organization',
      'sessionId' => @session_identifier,
      'pageViewId' => @page_view_identifier,
      'timestamp' => @timestamp,
      'url' => 'http://www.waffleshop.com/hello-world',
      'ip_address' => '::1',
      'deviceData' => {
        'fingerprint' => @device_fingerprint,
        'userAgent' => 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
        'browser' => 'Chrome',
        'browserVersion' => '1.0',
        'os' => 'Max OS X',
        'osVersion' => '5.0',
      },
      'data' => {
        'organizationIdentifier' => @organization_identifier,
        'name' => 'Waffle Shop',
        'num_employees' => 1_000
      }
    }
  end

  describe '#process!' do
    it 'creates a new organization if one does not exist for the provided unique_identifier' do
      expect(@swishjam_organization.analytics_organizations.count).to be(0)
      expect(Analytics::Session.count).to be(0)
    
      AnalyticsEventProcessors::Organization.new(@swishjam_organization.public_key, @page_view_event_payload).process!
      
      expect(@swishjam_organization.analytics_organizations.count).to be(1)
      new_organization = @swishjam_organization.analytics_organizations.last
      expect(new_organization.unique_identifier).to eq(@organization_identifier)
      expect(new_organization.name).to eq('Waffle Shop')
      expect(new_organization.metadata.count).to be(1)
      expect(new_organization.metadata.first.key).to eq('num_employees')
      expect(new_organization.metadata.first.value).to eq('1000')
      expect(new_organization.sessions.count).to eq(1)
    end

    it 'updates an existing organization if one already exists for the provided unique_identifier' do
      existing_organization = FactoryBot.create(:analytics_organization,
        swishjam_organization: @swishjam_organization,
        unique_identifier: @organization_identifier,
        name: 'Original Organization Name',
      )
      expect(@swishjam_organization.analytics_organizations.count).to be(1)
      expect(existing_organization.sessions.count).to be(0)
      
      AnalyticsEventProcessors::Organization.new(@swishjam_organization.public_key, @page_view_event_payload).process!

      expect(@swishjam_organization.analytics_organizations.count).to be(1)
      existing_organization.reload
      expect(existing_organization.unique_identifier).to eq(@organization_identifier)
      expect(existing_organization.name).to eq('Waffle Shop')
      expect(existing_organization.metadata.count).to be(1)
      expect(existing_organization.metadata.first.key).to eq('num_employees')
      expect(existing_organization.metadata.first.value).to eq('1000')
      expect(existing_organization.sessions.count).to eq(1)
    end

    it 'creates a new session if one does not exist' do
      expect(Analytics::Session.count).to be(0)
      AnalyticsEventProcessors::Organization.new(@swishjam_organization.public_key, @page_view_event_payload).process!
      new_session = Analytics::Session.last

      expect(Analytics::Session.count).to be(1)
      expect(new_session.unique_identifier).to eq(@session_identifier)
    end

    it 'uses an existing session and device if one already exists for the provided session_unique_identifier' do
      existing_device = FactoryBot.create(:analytics_device, fingerprint: @device_fingerprint, swishjam_organization: @swishjam_organization)
      existing_session = FactoryBot.create(:analytics_session, unique_identifier: @session_identifier, device: existing_device)
      expect(Analytics::Session.count).to be(1)
      expect(Analytics::Device.count).to be(1)
      
      AnalyticsEventProcessors::Organization.new(@swishjam_organization.public_key, @page_view_event_payload).process!

      expect(Analytics::Session.count).to be(1)
      expect(Analytics::Device.count).to be(1)
      existing_session.reload
      expect(existing_session.unique_identifier).to eq(@session_identifier)
      expect(existing_session.device).to eq(existing_device)
    end

    it 'creates a new device if one does not exist for the provided fingerprint' do
      expect(Analytics::Device.count).to be(0)
      AnalyticsEventProcessors::Organization.new(@swishjam_organization.public_key, @page_view_event_payload).process!
      new_device = Analytics::Device.last

      expect(Analytics::Device.count).to be(1)
      expect(new_device.fingerprint).to eq(@device_fingerprint)
      expect(new_device.user_agent).to eq('Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36')
      expect(new_device.browser).to eq('Chrome')
      expect(new_device.browser_version).to eq('1.0')
      expect(new_device.os).to eq('Max OS X')
      expect(new_device.os_version).to eq('5.0')
    end
  end
end