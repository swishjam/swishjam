require 'spec_helper'

RSpec.describe Ingestion::UserProfilesFromEventsPreparer do
  describe '#ingest!' do
    it 'creates a new user profile if one does not exist' do
      occurred_at = 10.minutes.ago

      workspace = FactoryBot.create(:workspace)
      public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key

      allow(Ingestion::QueueManager).to receive(:pop_all_records_from_queue).with(Ingestion::QueueManager::Queues.USER_PROFILES_FROM_EVENTS).and_return([
        { uuid: '123', swishjam_api_key: public_key, name: 'user_profile_from_event', occurred_at: occurred_at, properties: { id: 'unique!', email: 'somebody@gmail.com' }}.to_json,
        { uuid: '456', swishjam_api_key: public_key, name: 'user_profile_from_event', occurred_at: 30.minutes.ago, properties: { id: 'different!', first_name: 'Jenny', last_name: 'Rosen', subscription_plan: 'Gold' }}.to_json,
      ])

      expect(AnalyticsUserProfile.count).to eq(0)
      expect(IngestionBatch.count).to eq(0)

      batch = described_class.ingest!

      expect(AnalyticsUserProfile.count).to eq(2)
      expect(IngestionBatch.count).to eq(1)
      expect(batch.num_records).to eq(2)
      expect(batch.error_message).to be(nil)

      unique_user_profile = AnalyticsUserProfile.find_by(user_unique_identifier: 'unique!')
      expect(unique_user_profile.user_unique_identifier).to eq('unique!')
      expect(unique_user_profile.email).to eq('somebody@gmail.com')
      expect(unique_user_profile.first_name).to be(nil)
      expect(unique_user_profile.last_name).to be(nil)
      expect(unique_user_profile.metadata).to eq({})

      different_user_profile = AnalyticsUserProfile.find_by(user_unique_identifier: 'different!')
      expect(different_user_profile.user_unique_identifier).to eq('different!')
      expect(different_user_profile.email).to be(nil)
      expect(different_user_profile.first_name).to eq('Jenny')
      expect(different_user_profile.last_name).to eq('Rosen')
      expect(different_user_profile.metadata).to eq({ 'subscription_plan' => 'Gold' })
    end
  end
end