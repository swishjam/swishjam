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
      'type' => 'page',
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
        'previousUrl' => 'http://www.waffleshop.com/previous-page',
      }
    }
  end

  describe '#process!' do
    it 'creates a new page hit' do
      expect(Analytics::PageHit.count).to be(0)
      AnalyticsEventProcessors::PageView.new(@swishjam_organization.public_key, @page_view_event_payload).process!
      new_page_view = Analytics::PageHit.last

      expect(Analytics::PageHit.count).to be(1)
      expect(new_page_view.session.unique_identifier).to eq(@session_identifier)
      expect(new_page_view.unique_identifier).to eq(@page_view_identifier)
      expect(new_page_view.full_url).to eq('http://www.waffleshop.com/hello-world')
      expect(new_page_view.url_host).to eq('www.waffleshop.com')
      expect(new_page_view.url_path).to eq('/hello-world')
      expect(new_page_view.url_query).to be_nil
      expect(new_page_view.referrer_full_url).to eq('http://www.waffleshop.com/previous-page')
      expect(new_page_view.referrer_url_host).to eq('www.waffleshop.com')
      expect(new_page_view.referrer_url_path).to eq('/previous-page')
      expect(new_page_view.referrer_url_query).to be_nil
      expect(new_page_view.start_time).to eq(Time.at(@timestamp / 1_000))
    end

    it 'creates a new session if one does not exist' do
      expect(Analytics::Session.count).to be(0)
      AnalyticsEventProcessors::PageView.new(@swishjam_organization.public_key, @page_view_event_payload).process!
      new_session = Analytics::Session.last

      expect(Analytics::Session.count).to be(1)
      expect(new_session.unique_identifier).to eq(@session_identifier)
      expect(new_session.device.fingerprint).to eq(@device_fingerprint)
      expect(new_session.latitude).to eq(36.1659)
      expect(new_session.longitude).to eq(-86.7844)
      expect(new_session.city).to eq('Nashville')
      expect(new_session.region).to eq('Tennessee')
      expect(new_session.country).to eq('US')
      expect(new_session.postal_code).to eq('37201')
      expect(new_session.start_time).to eq(Time.at(@timestamp / 1_000))
    end

    it 'uses an existing session and device if one already exists for the provided session_unique_identifier' do
      existing_device = FactoryBot.create(:analytics_device, swishjam_organization: @swishjam_organization, fingerprint: @device_fingerprint)
      existing_session = FactoryBot.create(:analytics_session, device: existing_device, unique_identifier: @session_identifier)
      expect(Analytics::Session.count).to be(1)
      expect(Analytics::PageHit.count).to be(0)
      AnalyticsEventProcessors::PageView.new(@swishjam_organization.public_key, @page_view_event_payload).process!
      expect(Analytics::Session.count).to be(1)
      expect(Analytics::PageHit.count).to be(1)
      page_view = Analytics::PageHit.last
      expect(page_view.session).to eq(existing_session)
    end

    it 'creates a new session on the same device if one already exists for the provided device_fingerprint but not for the provided session_unique_identifier' do
      existing_device = FactoryBot.create(:analytics_device, swishjam_organization: @swishjam_organization, fingerprint: @device_fingerprint)
      existing_session = FactoryBot.create(:analytics_session, device: existing_device, unique_identifier: 'some-other-session-identifier')
      expect(Analytics::Device.count).to be(1)
      expect(Analytics::Session.count).to be(1)
      expect(Analytics::PageHit.count).to be(0)
      AnalyticsEventProcessors::PageView.new(@swishjam_organization.public_key, @page_view_event_payload).process!
      expect(Analytics::Session.count).to be(2)
      expect(Analytics::PageHit.count).to be(1)
      expect(Analytics::Device.count).to be(1)
      page_view = Analytics::PageHit.last
      expect(page_view.session.device).to eq(existing_device)
    end
  end
end