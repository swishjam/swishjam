require 'spec_helper'

RSpec.describe EventReceivers::Resend do
  describe '#receive!' do
    it 'parses the event payload and enqueues the event for ingestion' do
      event_occurred_at = 10.minutes.ago
      workspace = create(:workspace)
      resend_integration = create(:resend_integration, workspace: workspace)
      event_payload = {
        'type' => 'email.sent',
        'data' => {
          'email_id' => 'unique_z',
          'created_at' => event_occurred_at.to_datetime.to_s,
          'from' => 'somebody@gmail.com',
          'to' => ['jenny@swishjam.com'],
          'subject' => 'A SUBJECT!',
        }
      }
      existing_user = create(:analytics_user_profile, workspace: workspace, email: 'jenny@swishjam.com')

      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).with(
        Ingestion::QueueManager::Queues.EVENTS, 
        [Analytics::Event.formatted_for_ingestion(
          uuid: 'unique_z',
          swishjam_api_key: workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.RESEND).public_key,
          name: 'resend.email.sent',
          occurred_at: DateTime.parse(event_occurred_at.to_datetime.to_s),
          properties: {
            'from' => 'somebody@gmail.com',
            'to' => 'jenny@swishjam.com',
            'subject' => 'A SUBJECT!',
            'user_profile_id' => existing_user.id,
          }
        )]
      ).once
      EventReceivers::Resend.new(workspace.id, event_payload).receive!
    end

    it 'creates a new user if one does not exist for the first email in the to field' do
      event_occurred_at = 10.minutes.ago
      workspace = create(:workspace)
      resend_integration = create(:resend_integration, workspace: workspace)
      event_payload = {
        'type' => 'email.sent',
        'data' => {
          'email_id' => 'unique_z',
          'created_at' => event_occurred_at.to_datetime.to_s,
          'from' => 'somebody@gmail.com',
          'to' => ['jenny@swishjam.com'],
          'subject' => 'A SUBJECT!',
        }
      }

      # these tests fail when out of order and without this line, ugh, DB is not cleaned up properly
      AnalyticsUserProfile.destroy_all

      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).once
      expect(AnalyticsUserProfile.count).to eq(0)
      EventReceivers::Resend.new(workspace.id, event_payload).receive!
      expect(AnalyticsUserProfile.count).to eq(1)
      expect(AnalyticsUserProfile.first.email).to eq('jenny@swishjam.com')
      expect(AnalyticsUserProfile.first.created_by_data_source).to eq(ApiKey::ReservedDataSources.RESEND)
    end
  end
end