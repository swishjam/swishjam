require 'spec_helper'

describe ClickHouseQueries::Users::Retention::Weekly do
  describe '#get' do
    it 'calculates the retention cohorts' do
      workspace = FactoryBot.create(:workspace)
      my_public_key = workspace.api_keys.first.public_key

      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 1, created_at: 2.weeks.ago, swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 1, device_identifier: 'device_1', swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_event, name: 'did something?', swishjam_api_key: my_public_key, occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_1' }.to_json)
      FactoryBot.create(:analytics_event, name: 'did something?', swishjam_api_key: my_public_key, occurred_at: 1.week.ago, properties: { device_identifier: 'device_1' }.to_json)

      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 2, created_at: 2.weeks.ago, swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 2, device_identifier: 'device_2', swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_event, name: 'did something?', swishjam_api_key: my_public_key, occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_2' }.to_json)

      # this user should not be counted because their cohort is 5 weeks ago, which is outside of the 4 week window
      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 3, created_at: 5.weeks.ago, swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 3, device_identifier: 'device_3', swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_event, name: 'did something?', swishjam_api_key: my_public_key, occurred_at: 3.weeks.ago, properties: { device_identifier: 'device_3' }.to_json)
      FactoryBot.create(:analytics_event, name: 'did something?', swishjam_api_key: my_public_key, occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_3' }.to_json)

      # different workspaces should never be counted!
      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 4, created_at: 2.weeks.ago, swishjam_api_key: 'someone_else')
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 4, device_identifier: 'device_3', swishjam_api_key: 'someone_else')
      FactoryBot.create(:analytics_event, name: 'did something?', swishjam_api_key: 'someone_else', occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_3' }.to_json)

      data = described_class.new([my_public_key]).get
      expect(data.keys.count).to be(1)
      two_weeks_ago_cohort_date = 2.weeks.ago.beginning_of_week.to_date
      expect(data[two_weeks_ago_cohort_date.to_s].keys.count).to be(2)
      expect(data[two_weeks_ago_cohort_date.to_s][2.weeks.ago.beginning_of_week.to_date.to_s]).to be(2)
      expect(data[two_weeks_ago_cohort_date.to_s][1.week.ago.beginning_of_week.to_date.to_s]).to be(1)
    end

    it 'considers a user as active only if they have event activity that meets the `events_to_be_considered_active` parameter' do
      workspace = FactoryBot.create(:workspace)
      my_public_key = workspace.api_keys.first.public_key

      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 1, created_at: 2.weeks.ago, swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 1, device_identifier: 'device_1', swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_1' }.to_json)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 1.week.ago, properties: { device_identifier: 'device_1' }.to_json)

      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 2, created_at: 2.weeks.ago, swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 2, device_identifier: 'device_2', swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_2' }.to_json)

      # this user should be counted in the num_users_in_cohort, but not be counted in any of the active user counts 
      # because they don't have any events that match the `events_to_be_considered_active` parameter
      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 3, created_at: 2.weeks.ago, swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 3, device_identifier: 'device_3', swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_event, name: 'some other event!', swishjam_api_key: my_public_key, occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_3' }.to_json)
      FactoryBot.create(:analytics_event, name: 'some other event!', swishjam_api_key: my_public_key, occurred_at: 1.weeks.ago, properties: { device_identifier: 'device_3' }.to_json)

      # this user should not be counted because their cohort is 5 weeks ago, which is outside of the 4 week window
      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 4, created_at: 5.weeks.ago, swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 4, device_identifier: 'device_4', swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 3.weeks.ago, properties: { device_identifier: 'device_4' }.to_json)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_4' }.to_json)

      # different workspaces should never be counted!
      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 5, created_at: 2.weeks.ago, swishjam_api_key: 'someone_else')
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 5, device_identifier: 'device_5', swishjam_api_key: 'someone_else')
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: 'someone_else', occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_5' }.to_json)

      data = described_class.new([my_public_key], events_to_be_considered_active: ['my_active_user_event']).get
      expect(data.keys.count).to be(1)
      two_weeks_ago_cohort_date = 2.weeks.ago.beginning_of_week.to_date
      expect(data[two_weeks_ago_cohort_date.to_s].keys.count).to be(2)
      expect(data[two_weeks_ago_cohort_date.to_s][2.weeks.ago.beginning_of_week.to_date.to_s]).to be(2)
      expect(data[two_weeks_ago_cohort_date.to_s][1.week.ago.beginning_of_week.to_date.to_s]).to be(1)
    end
  end
end