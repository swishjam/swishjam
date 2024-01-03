require 'spec_helper'

describe Analytics::Event do
  describe '#parsed_from_ingestion_queue' do
    it 'parses the event correctly when the properties are a string' do
      occurred_at = 10.minutes.ago
      event_json = {
        uuid: '123',
        swishjam_api_key: 'abc',
        name: 'page_view',
        occurred_at: occurred_at,
        properties: { 'foo' => 'bar' }.to_json
      }
      event = Analytics::Event.parsed_from_ingestion_queue(event_json)
      expect(event.properties['foo']).to eq('bar')
      expect(event.properties.foo).to eq('bar')
      expect(event.uuid).to eq('123')
      expect(event.swishjam_api_key).to eq('abc')
      expect(event.name).to eq('page_view')
      expect(event.occurred_at.to_s).to eq(occurred_at.to_s)
    end

    it 'fills in the user_attributes and organization_attributes properties field when not present' do
      occurred_at = 10.minutes.ago
      event_json = {
        uuid: '123',
        swishjam_api_key: 'abc',
        name: 'page_view',
        occurred_at: occurred_at,
        properties: { 'foo' => 'bar' }.to_json
      }
      event = Analytics::Event.parsed_from_ingestion_queue(event_json)
      expect(event.properties['foo']).to eq('bar')
      expect(event.properties.foo).to eq('bar')
      expect(event.properties.user_attributes.to_h).to eq({})
      expect(event.properties.organization_attributes.to_h).to eq({})
      expect(event.uuid).to eq('123')
      expect(event.swishjam_api_key).to eq('abc')
      expect(event.name).to eq('page_view')
      expect(event.occurred_at.to_s).to eq(occurred_at.to_s)
    end

    it 'uses the user_attributes and organization_attributes properties field when present' do
      occurred_at = 10.minutes.ago
      event_json = {
        uuid: '123',
        swishjam_api_key: 'abc',
        name: 'page_view',
        occurred_at: occurred_at,
        properties: { 
          'foo' => 'bar',
          'user_attributes' => { 'baz' => 'boo' },
          'organization_attributes' => { 'bonk' => 'head' },
        }.to_json
      }
      event = Analytics::Event.parsed_from_ingestion_queue(event_json)
      expect(event.properties['foo']).to eq('bar')
      expect(event.properties.foo).to eq('bar')
      expect(event.properties.user_attributes.baz).to eq('boo')
      expect(event.properties.organization_attributes.bonk).to eq('head')
      expect(event.uuid).to eq('123')
      expect(event.swishjam_api_key).to eq('abc')
      expect(event.name).to eq('page_view')
      expect(event.occurred_at.to_s).to eq(occurred_at.to_s)
    end

    it 'parses the full payload to JSON when it is a string' do
      occurred_at = 10.minutes.ago
      event_json = {
        uuid: '123',
        swishjam_api_key: 'abc',
        name: 'page_view',
        occurred_at: occurred_at,
        properties: { 
          'foo' => 'bar',
          'user_attributes' => { 'baz' => 'boo' },
          'organization_attributes' => { 'bonk' => 'head' },
        }.to_json
      }.to_json
      event = Analytics::Event.parsed_from_ingestion_queue(event_json)
      expect(event.properties['foo']).to eq('bar')
      expect(event.properties.foo).to eq('bar')
      expect(event.properties.user_attributes.baz).to eq('boo')
      expect(event.properties.organization_attributes.bonk).to eq('head')
      expect(event.uuid).to eq('123')
      expect(event.swishjam_api_key).to eq('abc')
      expect(event.name).to eq('page_view')
      expect(event.occurred_at.to_s).to eq(occurred_at.to_s)
    end

    it 'raises an error when the event is missing required fields' do
      event_json = {
        uuid: '123',
        swishjam_api_key: 'abc',
        occurred_at: 10.minutes.ago,
        properties: { 'foo' => 'bar' }.to_json
      }
      expect { Analytics::Event.parsed_from_ingestion_queue(event_json) }.to raise_error(Analytics::Event::InvalidEventFormat)
    end
  end
end
