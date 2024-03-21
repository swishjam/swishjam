require 'spec_helper'

describe Ingestion::EventPreparers::Segment::IdentifyHandler do
  let(:workspace) { create(:workspace) }
  let(:segment_integration) { create(:segment_integration, workspace: workspace) }
  let(:parsed_event) do
    Ingestion::ParsedEventFromIngestion.new(
      uuid: '1',
      swishjam_api_key: segment_integration.reload.swishjam_api_key.public_key,
      name: 'segment.identify',
      occurred_at: Time.current,
      properties: {
        "messageId": "segment-test-message-qyqw74",
        "timestamp": "2024-03-21T00:42:14.693Z",
        "type": "identify",
        "userId": "some-unique-user-id",
        "traits": {
          "email": "test@example.org",
          "name": "John Doe",
          "birthday": "11/07/1992",
        },
        "context": {
          'userAgentData': {
            'mobile': true,
          },
          "page": {
            "url": "https://example.org",
            "referrer": "https://google.com",
            "path": "/",
          }
        }
      }
    )
  end

  describe '#handle_and_return_prepared_events!' do
    it 'creates a new user profile' do
      expect(workspace.analytics_user_profiles.count).to eq(0)
      
      prepared_event = described_class.new(parsed_event).handle_and_return_prepared_events!
      
      expect(workspace.analytics_user_profiles.count).to eq(1)
      user = workspace.analytics_user_profiles.first
      expect(user.user_unique_identifier).to eq('some-unique-user-id')
      expect(user.email).to eq('test@example.org')
      expect(user.metadata['name']).to eq('John Doe')
      expect(user.metadata['birthday']).to eq('11/07/1992')
      expect(user.metadata['initial_landing_page_url']).to eq('https://example.org')
      expect(user.metadata['initial_referrer_url']).to eq('https://google.com')
      expect(user.metadata.keys.count).to eq(4)

      expect(prepared_event.name).to eq('identify')
      expect(prepared_event.user_profile_id).to eq(user.id)
      expect(prepared_event.properties[Analytics::Event::ReservedPropertyNames.URL]).to eq('https://example.org')
      expect(prepared_event.properties[Analytics::Event::ReservedPropertyNames.REFERRER]).to eq('https://google.com')
      expect(prepared_event.properties['email']).to eq('test@example.org')
      expect(prepared_event.properties['is_mobile']).to eq(true)
      expect(prepared_event.properties['name']).to eq('John Doe')
      expect(prepared_event.properties['birthday']).to eq('11/07/1992')
      expect(prepared_event.properties.keys.count).to eq(6)
    end

    it 'updates an existing user profile' do
      user = create(:analytics_user_profile, workspace: workspace, user_unique_identifier: 'some-unique-user-id', email: 'an-old-email@gmail.com', metadata: { 'name' => 'Old Name', 'favorite_color' => 'red' })
      expect(workspace.analytics_user_profiles.count).to eq(1)
      
      prepared_event = described_class.new(parsed_event).handle_and_return_prepared_events!
      
      expect(workspace.analytics_user_profiles.count).to eq(1)
      user.reload
      expect(user.user_unique_identifier).to eq('some-unique-user-id')
      expect(user.email).to eq('test@example.org')
      expect(user.metadata['name']).to eq('John Doe')
      expect(user.metadata['birthday']).to eq('11/07/1992')
      expect(user.metadata['initial_landing_page_url']).to eq('https://example.org')
      expect(user.metadata['initial_referrer_url']).to eq('https://google.com')
      expect(user.metadata['favorite_color']).to eq('red')
      expect(user.metadata.keys.count).to eq(5)

      expect(prepared_event.name).to eq('identify')
      expect(prepared_event.user_profile_id).to eq(user.id)
      expect(prepared_event.properties[Analytics::Event::ReservedPropertyNames.URL]).to eq('https://example.org')
      expect(prepared_event.properties[Analytics::Event::ReservedPropertyNames.REFERRER]).to eq('https://google.com')
      expect(prepared_event.properties['email']).to eq('test@example.org')
      expect(prepared_event.properties['is_mobile']).to eq(true)
      expect(prepared_event.properties['name']).to eq('John Doe')
      expect(prepared_event.properties['birthday']).to eq('11/07/1992')
      expect(prepared_event.properties.keys.count).to eq(6)
    end
  end
end