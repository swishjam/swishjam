require 'spec_helper'

describe Ingestion::EventPreparers::Helpers::UserPropertiesAugmentor do
  def parsed_event(swishjam_api_key:, name: 'some_random_event', timestamp: 10.minutes.ago, properties: {}, user_properties: {}, device_identifier: '123')
    Ingestion::ParsedEventFromIngestion.new({
      'uuid' => 'evt-123',
      'swishjam_api_key' => swishjam_api_key,
      'name' => name,
      'occurred_at' => timestamp.to_f,
      'properties' => {
        'device_fingerprint' => 'abc',
        'device_identifier' => device_identifier,
      }.merge(properties),
      'user_properties' => user_properties,
    })
  end

  before do
    @workspace = FactoryBot.create(:workspace)
    @public_key = @workspace.api_keys.for_data_source!('product').public_key
  end

  describe '#augment_user_properties!' do
    it 'automatically applies the initial landing page, referrer, and UTM params to the user profile from the event' do
      parsed_event = parsed_event(
        swishjam_api_key: @public_key, 
        properties: { 
          Analytics::Event::ReservedPropertyNames.URL => 'http://example.com/yo?foo=bar', 
          Analytics::Event::ReservedPropertyNames.PAGE_REFERRER => 'http://page_referrer.com?baz=bye', 
          Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL => 'http://landing.com/a-path?say=hello', 
          Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_URL => 'http://session_referrer.com?hi=bye', 
          Analytics::Event::ReservedPropertyNames.REFERRER => 'http://referrer.com?say=goodbye',
          Analytics::Event::ReservedPropertyNames.SESSION_UTM_CAMPAIGN => 'my_utm_campaign',
          Analytics::Event::ReservedPropertyNames.SESSION_UTM_SOURCE => 'my_utm_source',
          Analytics::Event::ReservedPropertyNames.SESSION_UTM_MEDIUM => 'my_utm_medium',
          Analytics::Event::ReservedPropertyNames.SESSION_UTM_CONTENT => 'my_utm_content',
          Analytics::Event::ReservedPropertyNames.SESSION_UTM_TERM => 'my_utm_term',
          Analytics::Event::ReservedPropertyNames.SESSION_GCLID => 'my_gclid',
        }
      )
      
      # event properties should always be augmented first...
      Ingestion::EventPreparers::Helpers::EventPropertiesAugmentor.new(parsed_event).augment_properties!
      described_class.new(parsed_event).augment_user_properties!

      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL]).to eq('http://landing.com/a-path?say=hello')
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL_PATH]).to eq('/a-path')
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL_HOST]).to eq('landing.com')
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL_QUERY_PARAMS]).to eq('say=hello')
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_BASE_URL]).to eq('landing.com/a-path')

      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL]).to eq('http://session_referrer.com?hi=bye')
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL_PATH]).to eq('/')
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL_HOST]).to eq('session_referrer.com')
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL_QUERY_PARAMS]).to eq('hi=bye')
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_BASE_URL]).to eq('session_referrer.com')

      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_CAMPAIGN]).to eq('my_utm_campaign')
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_SOURCE]).to eq('my_utm_source')
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_MEDIUM]).to eq('my_utm_medium')
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_CONTENT]).to eq('my_utm_content')
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_TERM]).to eq('my_utm_term')
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_GCLID]).to eq('my_gclid')
    end

    it 'does not set any augmented properties if the user already has any of the augmented properties already applied' do
      parsed_event = parsed_event(
        swishjam_api_key: @public_key, 
        properties: { 
          Analytics::Event::ReservedPropertyNames.URL => 'http://example.com/yo?foo=bar', 
          Analytics::Event::ReservedPropertyNames.PAGE_REFERRER => 'http://page_referrer.com?baz=bye', 
          Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL => 'http://landing.com/a-path?say=hello', 
          Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_URL => 'http://session_referrer.com?hi=bye', 
          Analytics::Event::ReservedPropertyNames.REFERRER => 'http://referrer.com?say=goodbye',
          Analytics::Event::ReservedPropertyNames.SESSION_UTM_CAMPAIGN => 'my_utm_campaign',
          Analytics::Event::ReservedPropertyNames.SESSION_UTM_SOURCE => 'my_utm_source',
          Analytics::Event::ReservedPropertyNames.SESSION_UTM_MEDIUM => 'my_utm_medium',
          Analytics::Event::ReservedPropertyNames.SESSION_UTM_CONTENT => 'my_utm_content',
          Analytics::Event::ReservedPropertyNames.SESSION_UTM_TERM => 'my_utm_term',
          Analytics::Event::ReservedPropertyNames.SESSION_GCLID => 'my_gclid',
        },
        user_properties: {
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_CAMPAIGN => 'existing_utm_campaign!',
        }
      )
      
      # event properties should always be augmented first...
      Ingestion::EventPreparers::Helpers::EventPropertiesAugmentor.new(parsed_event).augment_properties!
      described_class.new(parsed_event).augment_user_properties!
      
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_CAMPAIGN]).to eq('existing_utm_campaign!')

      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL]).to be(nil)
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL_PATH]).to be(nil)
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL_HOST]).to be(nil)
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL_QUERY_PARAMS]).to be(nil)
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_BASE_URL]).to be(nil)

      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL]).to be(nil)
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL_PATH]).to be(nil)
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL_HOST]).to be(nil)
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL_QUERY_PARAMS]).to be(nil)
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_BASE_URL]).to be(nil)

      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_SOURCE]).to be(nil)
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_MEDIUM]).to be(nil)
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_CONTENT]).to be(nil)
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_TERM]).to be(nil)
      expect(parsed_event.user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_GCLID]).to be(nil)
    end
  end
end