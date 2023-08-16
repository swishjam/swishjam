require 'spec_helper'

describe AnalyticsEventProcessors::Custom do
  before do
    setup_test_data
    @device_fingerprint = "unique-device-fingerprint"
    @user_id = 'user-provided-unique-id'
    @organization_identifier = 'user-provided-organization-identifier'
    @page_view_identifier = 'user-provided-page-view-identifier'
    @session_identifier = 'swishjam-generated-session-identifier'
    @timestamp = 1.minute.ago.to_i * 1_000
    @event_payload = {
      'type' => 'customEventName',
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
        'some-custom-attribute' => 'some custom value!',
      }
    }
  end

  describe '#process!' do
    it 'creates a new custom event' do
      expect(Analytics::Event.count).to be(0)
      AnalyticsEventProcessors::Custom.new(@swishjam_organization.public_key, @event_payload).process!

      new_event = Analytics::Event.last
      expect(Analytics::Event.count).to be(1)
      expect(new_event.name).to eq('customEventName')
      expect(new_event.timestamp).to eq(Time.at(@timestamp / 1_000))
    end

    it 'creates a new session if one does not exist' do
      expect(Analytics::Session.count).to be(0)
      AnalyticsEventProcessors::Custom.new(@swishjam_organization.public_key, @event_payload).process!

      new_session = Analytics::Session.last
      expect(Analytics::Session.count).to be(1)
      expect(new_session.unique_identifier).to eq(@session_identifier)
      expect(new_session.device.fingerprint).to eq(@device_fingerprint)
    end

    it 'creates a new page hit if one does not exist' do
      expect(Analytics::PageHit.count).to be(0)
      AnalyticsEventProcessors::Custom.new(@swishjam_organization.public_key, @event_payload).process!

      new_page_hit = Analytics::PageHit.last
      expect(Analytics::PageHit.count).to be(1)
      expect(new_page_hit.session.unique_identifier).to eq(@session_identifier)
      expect(new_page_hit.unique_identifier).to eq(@page_view_identifier)
      expect(new_page_hit.full_url).to eq('http://www.waffleshop.com/hello-world')
      expect(new_page_hit.url_host).to eq('www.waffleshop.com')
      expect(new_page_hit.url_path).to eq('/hello-world')
      expect(new_page_hit.url_query).to be_nil
      expect(new_page_hit.start_time).to eq(Time.at(@timestamp / 1_000))
    end

    it 'creates a new device if one does not exist' do
      expect(Analytics::Device.count).to be(0)
      AnalyticsEventProcessors::Custom.new(@swishjam_organization.public_key, @event_payload).process!

      new_device = Analytics::Device.last
      expect(Analytics::Device.count).to be(1)
      expect(new_device.fingerprint).to eq(@device_fingerprint)
      expect(new_device.user_agent).to eq('Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36')
      expect(new_device.browser).to eq('Chrome')
      expect(new_device.browser_version).to eq('1.0')
      expect(new_device.os).to eq('Max OS X')
      expect(new_device.os_version).to eq('5.0')
    end

    it 'uses an existing session if one already exists' do
      existing_device = FactoryBot.create(:analytics_device, swishjam_organization: @swishjam_organization, fingerprint: @device_fingerprint)
      existing_session = FactoryBot.create(:analytics_session, device: existing_device, unique_identifier: @session_identifier)
      expect(Analytics::Session.count).to be(1)
      AnalyticsEventProcessors::Custom.new(@swishjam_organization.public_key, @event_payload).process!
      expect(Analytics::Session.count).to be(1)
      expect(Analytics::Session.last).to eq(existing_session)
      event = Analytics::Event.last
      expect(event.session).to eq(existing_session)
    end

    it 'uses an existing page hit if one already exists' do
      existing_device = FactoryBot.create(:analytics_device, 
        swishjam_organization: @swishjam_organization, 
        fingerprint: @device_fingerprint
      )
      existing_session = FactoryBot.create(:analytics_session, 
        device: existing_device, 
        unique_identifier: @session_identifier
      )
      existing_page_hit = FactoryBot.create(:analytics_page_hit, 
        session: existing_session, 
        device: existing_device, 
        unique_identifier: @page_view_identifier
      )
      expect(Analytics::PageHit.count).to be(1)
      AnalyticsEventProcessors::Custom.new(@swishjam_organization.public_key, @event_payload).process!
      expect(Analytics::PageHit.count).to be(1)
      expect(Analytics::PageHit.last).to eq(existing_page_hit)
      event = Analytics::Event.last
      expect(event.page_hit).to eq(existing_page_hit)
    end

    it 'uses an existing device if one already exists' do
      existing_device = FactoryBot.create(:analytics_device, swishjam_organization: @swishjam_organization, fingerprint: @device_fingerprint)
      expect(Analytics::Device.count).to be(1)
      AnalyticsEventProcessors::Custom.new(@swishjam_organization.public_key, @event_payload).process!
      expect(Analytics::Device.count).to be(1)
      expect(Analytics::Device.last).to eq(existing_device)
      event = Analytics::Event.last
      expect(event.device).to eq(existing_device)
    end
  end
end