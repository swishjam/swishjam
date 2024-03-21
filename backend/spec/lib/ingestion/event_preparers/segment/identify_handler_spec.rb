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
      expect(user.metadata).to eq({
        'name' => 'John Doe',
        'birthday' => '11/07/1992',
        'initial_landing_page_url' => 'https://example.org',
        'initial_referrer_url' => 'https://google.com',
      })

      expect(prepared_event.name).to eq('identify')
      expect(prepared_event.user_profile_id).to eq(user.id)
      expect(prepared_event.properties).to eq({
        Analytics::Event::ReservedPropertyNames.URL => 'https://example.org',
        Analytics::Event::ReservedPropertyNames.REFERRER => 'https://google.com',
        'is_mobile' => true,
        'name' => 'John Doe',
        'birthday' => '11/07/1992',
      })
    end
  end
end