require 'spec_helper'

describe Ingestion::EventPreparers::Helpers::EventPropertiesAugmentor do
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

  describe '#augment_properties!' do
    it 'normalizes the URL properties' do
      parsed_event = parsed_event(
        swishjam_api_key: @public_key, 
        properties: { 
          Analytics::Event::ReservedPropertyNames.URL => 'http://example.com/yo?foo=bar', 
          Analytics::Event::ReservedPropertyNames.PAGE_REFERRER => 'http://page_referrer.com?baz=bye', 
          Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL => 'http://landing.com/a-path?say=hello', 
          Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_URL => 'http://session_referrer.com?hi=bye', 
          Analytics::Event::ReservedPropertyNames.REFERRER => 'http://referrer.com?say=goodbye' 
        }
      )
      
      described_class.new(parsed_event).augment_properties!

      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.URL]).to eq('http://example.com/yo?foo=bar')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.URL_PATH]).to eq('/yo')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.URL_HOST]).to eq('example.com')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.URL_QUERY_PARAMS]).to eq('foo=bar')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.BASE_URL]).to eq('example.com/yo')

      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.PAGE_REFERRER]).to eq('http://page_referrer.com?baz=bye')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.PAGE_REFERRER_URL_PATH]).to eq('/')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.PAGE_REFERRER_URL_HOST]).to eq('page_referrer.com')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.PAGE_REFERRER_URL_QUERY_PARAMS]).to eq('baz=bye')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.PAGE_REFERRER_BASE_URL]).to eq('page_referrer.com')

      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_URL]).to eq('http://session_referrer.com?hi=bye')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_URL_PATH]).to eq('/')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_URL_HOST]).to eq('session_referrer.com')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_URL_QUERY_PARAMS]).to eq('hi=bye')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_BASE_URL]).to eq('session_referrer.com')

      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL]).to eq('http://landing.com/a-path?say=hello')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL_PATH]).to eq('/a-path')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL_HOST]).to eq('landing.com')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL_QUERY_PARAMS]).to eq('say=hello')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_BASE_URL]).to eq('landing.com/a-path')

      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.REFERRER]).to eq('http://referrer.com?say=goodbye')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.REFERRER_URL_PATH]).to eq('/')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.REFERRER_URL_HOST]).to eq('referrer.com')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.REFERRER_URL_QUERY_PARAMS]).to eq('say=goodbye')
      expect(parsed_event.properties[Analytics::Event::ReservedPropertyNames.REFERRER_BASE_URL]).to eq('referrer.com')
    end
  end
end

