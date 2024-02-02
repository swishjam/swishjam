require 'spec_helper'

describe DataMigrators::UserIdentifiesToAnalyticsUserProfileDevices do
  describe '#run!' do
    it 'gets the most recent user_identify_events for each device_identifier and inserts them into the analytics_user_profile_devices table in Postgres' do
      workspace_1 = FactoryBot.create(:workspace)
      workspace_2 = FactoryBot.create(:workspace)
      
      user_1 = FactoryBot.create(:analytics_user_profile, user_unique_identifier: '1', workspace: workspace_1)
      user_2 = FactoryBot.create(:analytics_user_profile, user_unique_identifier: '2', workspace: workspace_1)
      user_3 = FactoryBot.create(:analytics_user_profile, user_unique_identifier: '3', workspace: workspace_1)
      user_4 = FactoryBot.create(:analytics_user_profile, user_unique_identifier: '4', workspace: workspace_2)

      one_day_ago = 1.day.ago

      Analytics::UserIdentifyEvent.insert_all!([
        # should not be included because it's not the most recent for device1
        { uuid: SecureRandom.uuid, swishjam_api_key: workspace_1.api_keys.first.public_key, swishjam_user_id: user_3.id, device_identifier: 'device1', occurred_at: 2.day.ago, ingested_at: 2.day.ago },
      ])

      Analytics::UserIdentifyEvent.insert_all!([
        { uuid: SecureRandom.uuid, swishjam_api_key: workspace_1.api_keys.first.public_key, swishjam_user_id: user_1.id, device_identifier: 'device1', occurred_at: one_day_ago, ingested_at: one_day_ago },
        { uuid: SecureRandom.uuid, swishjam_api_key: workspace_1.api_keys.first.public_key, swishjam_user_id: user_2.id, device_identifier: 'device2', occurred_at: one_day_ago, ingested_at: one_day_ago },
        # different workspace
        { uuid: SecureRandom.uuid, swishjam_api_key: workspace_2.api_keys.first.public_key, swishjam_user_id: user_4.id, device_identifier: 'device3', occurred_at: one_day_ago, ingested_at: one_day_ago },
      ])

      og_user_identify_events = Analytics::ClickHouseRecord.execute_sql('SELECT * FROM user_identify_events ORDER BY occurred_at')

      described_class.run!

      user_identify_events_TEMP_records = Analytics::ClickHouseRecord.execute_sql('SELECT * FROM migrated_user_identify_events_TEMP ORDER BY occurred_at')
      expect(user_identify_events_TEMP_records).to eq(og_user_identify_events)
      expect(Analytics::UserIdentifyEvent.count).to eq(0)

      expect(AnalyticsUserProfileDevice.count).to eq(3)
      
      device_1 = AnalyticsUserProfileDevice.find_by(swishjam_cookie_value: 'device1')
      expect(device_1.analytics_user_profile_id).to eq(user_1.id)
      expect(device_1.workspace_id).to eq(workspace_1.id)
      expect(device_1.created_at).to be_within(1.second).of(one_day_ago)

      device_2 = AnalyticsUserProfileDevice.find_by(swishjam_cookie_value: 'device2')
      expect(device_2.analytics_user_profile_id).to eq(user_2.id)
      expect(device_2.workspace_id).to eq(workspace_1.id)
      expect(device_2.created_at).to be_within(1.second).of(one_day_ago)

      device_3 = AnalyticsUserProfileDevice.find_by(swishjam_cookie_value: 'device3')
      expect(device_3.analytics_user_profile_id).to eq(user_4.id)
      expect(device_3.workspace_id).to eq(workspace_2.id)
      expect(device_3.created_at).to be_within(1.second).of(one_day_ago)

      # if we run it again, it should not insert any new records
      described_class.run!

      expect(AnalyticsUserProfileDevice.count).to eq(3)
    end
  end
end