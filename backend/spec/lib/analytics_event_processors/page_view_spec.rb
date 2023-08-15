require 'rails_helper'

describe AnalyticsEventProcessors::PageView do
  before do
    setup_test_data
    @device_fingerprint = "unique-device-fingerprint"
    @user_id = 'user-provided-unique-id'
    @organization_identifier = 'user-provided-organization-identifier'
    @page_view_identifier = 'user-provided-page-view-identifier'
    @session_identifier = 'swishjam-generated-session-identifier'
    @timestamp = 1.minute.ago.to_i * 1_000
    @page_hit_event_payload = {
      'type' => 'page',
      'sessionId' => @session_identifier,
      'pageViewId' => @page_view_identifier,
      'organizationIdentifier' => @event_payload_organization_identifier,
      'timestamp' => @timestamp,
      'url' => 'http://www.waffleshop.com/hello-world',
      'deviceData' => {
        'fingerprint' => @event_payload_device_fingerprint,
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

  it 'creates a new page hit' do
    expect(Analytics::PageHit.count).to be(0)
    AnalyticsEventProcessors::PageView.new(@swishjam_organization.public_key, @page_hit_event_payload).process!
    new_page_hit = Analytics::PageHit.last

    expect(Analytics::PageHit.count).to be(1)
    expect(new_page_hit.session.unique_identifier).to eq(@session_identifier)
    expect(new_page_hit.unique_identifier).to eq(@page_view_identifier)
    expect(new_page_hit.full_url).to eq('http://www.waffleshop.com/hello-world')
    expect(new_page_hit.url_host).to eq('www.waffleshop.com')
    expect(new_page_hit.url_path).to eq('/hello-world')
    expect(new_page_hit.url_query).to be_nil
    expect(new_page_hit.referrer_full_url).to eq('http://www.waffleshop.com/previous-page')
    expect(new_page_hit.referrer_url_host).to eq('www.waffleshop.com')
    expect(new_page_hit.referrer_url_path).to eq('/previous-page')
    expect(new_page_hit.referrer_url_query).to be_nil
    expect(new_page_hit.start_time).to eq(Time.at(@timestamp / 1_000))
  end

  it 'creates a new session if one does not exist' do
    expect(Analytics::Session.count).to be(0)
    AnalyticsEventProcessors::PageView.new(@swishjam_organization.public_key, @page_hit_event_payload).process!
    new_session = Analytics::Session.last

    expect(Analytics::Session.count).to be(1)
    expect(new_session.unique_identifier).to eq(@session_identifier)
    expect(new_session.device.unique_identifier).to eq(@event_payload_device_fingerprint)
    # expect(new_session.organization_identifier).to eq(@event_payload_organization_identifier)
  end
end