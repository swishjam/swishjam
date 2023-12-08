require 'spec_helper'

RSpec.describe EventReceivers::CalCom do
  describe '#receive!' do
    it 'parses the event payload and enqueues the event for ingestion' do
      event_occurred_at = 10.minutes.ago
      workspace = create(:workspace)
      cal_com_integration = create(:cal_com_integration, workspace: workspace)
      event_payload = {
        'triggerEvent' => 'A_CAL_COM_TRIGGER_EVENT',
        'createdAt' => event_occurred_at.to_datetime.to_s,
        'payload' => {
          'uid' => 'unique_1',
          'type' => 'A_CAL_COM_TYPE',
          'title' => 'SOMETHING_HAPPENED_IN_MY_CAL_COM_CALENDAR',
          'description' => "A DESCRIPTION OF WHAT HAPPENED IN MY CAL.COM CALENDAR",
          'startTime' => 1.day.from_now.to_datetime.to_s,
          'endTime' => 2.days.from_now.to_datetime.to_s,
          'length' => "A LENGTH?",
          'attendees' => [{ 'email' => 'jenny@swishjam.com' }, { 'email' => 'collin@swishjam.com' }],
        }
      }
      existing_user = create(:analytics_user_profile, workspace: workspace, email: 'jenny@swishjam.com')

      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).with(
        Ingestion::QueueManager::Queues.EVENTS, 
        [Analytics::Event.formatted_for_ingestion(
          uuid: 'unique_1',
          swishjam_api_key: workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.CAL_COM).public_key,
          name: 'cal.A_CAL_COM_TRIGGER_EVENT',
          occurred_at: DateTime.parse(event_occurred_at.to_datetime.to_s),
          # the order of the properties actually matter here, so we need to make sure they're in the right order
          properties: {
            'type' => event_payload.dig('payload', 'type'),
            'title' => event_payload.dig('payload', 'title'),
            'description' => event_payload.dig('payload', 'description'),
            'start_time' => DateTime.parse(event_payload.dig('payload', 'startTime')),
            'end_time' => DateTime.parse(event_payload.dig('payload', 'endTime')),
            'length' => event_payload.dig('payload', 'length'),
            'attendees' => (event_payload.dig('payload', 'attendees') || []).map{ |a| a['email'] }.join(', '),
            'user_profile_id' => existing_user.id,
          }
        )]
      ).once
      EventReceivers::CalCom.new(workspace.id, event_payload).receive!
    end

    it 'creates a new user if one does not yet exist for the stripe customer email' do
      event_occurred_at = 10.minutes.ago
      workspace = create(:workspace)
      cal_com_integration = create(:cal_com_integration, workspace: workspace)
      event_payload = {
        'triggerEvent' => 'A_CAL_COM_TRIGGER_EVENT',
        'createdAt' => event_occurred_at.to_datetime.to_s,
        'payload' => {
          'uid' => 'unique_1',
          'type' => 'A_CAL_COM_TYPE',
          'title' => 'SOMETHING_HAPPENED_IN_MY_CAL_COM_CALENDAR',
          'description' => "A DESCRIPTION OF WHAT HAPPENED IN MY CAL.COM CALENDAR",
          'startTime' => 1.day.from_now.to_datetime.to_s,
          'endTime' => 2.days.from_now.to_datetime.to_s,
          'length' => "A LENGTH?",
          'attendees' => [{ 'email' => 'jenny@swishjam.com' }, { 'email' => 'collin@swishjam.com' }],
        }
      }

      # these tests fail when out of order and without this line, ugh, DB is not cleaned up properly
      AnalyticsUserProfile.destroy_all

      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).once
      expect(AnalyticsUserProfile.count).to be(0)

      EventReceivers::CalCom.new(workspace.id, event_payload).receive!

      expect(AnalyticsUserProfile.count).to be(1)
      expect(AnalyticsUserProfile.first.email).to eq('jenny@swishjam.com')
      expect(AnalyticsUserProfile.first.created_by_data_source).to eq(ApiKey::ReservedDataSources.CAL_COM)
    end
  end
end