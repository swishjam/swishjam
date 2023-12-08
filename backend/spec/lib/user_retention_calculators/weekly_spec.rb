require 'spec_helper'

describe UserRetentionCalculators::Weekly do
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

      # this user should not be counted because their cohort is 5 weeks ago, which is outside of the default 4 week window
      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 3, created_at: 5.weeks.ago, swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 3, device_identifier: 'device_3', swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_event, name: 'did something?', swishjam_api_key: my_public_key, occurred_at: 3.weeks.ago, properties: { device_identifier: 'device_3' }.to_json)
      FactoryBot.create(:analytics_event, name: 'did something?', swishjam_api_key: my_public_key, occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_3' }.to_json)

      # different workspaces should never be counted!
      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 4, created_at: 2.weeks.ago, swishjam_api_key: 'someone_else')
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 4, device_identifier: 'device_3', swishjam_api_key: 'someone_else')
      FactoryBot.create(:analytics_event, name: 'did something?', swishjam_api_key: 'someone_else', occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_3' }.to_json)

      data = described_class.get([my_public_key])
      expect(data.keys.count).to be(3)

      this_weeks_cohort_data = data[Time.current.beginning_of_week.to_date.to_s]
      expect(this_weeks_cohort_data['num_users_in_cohort']).to be(0)
      expect(this_weeks_cohort_data['activity_periods'].keys.count).to be(1)
      expect(this_weeks_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(this_weeks_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(0)

      one_week_ago_cohort_data = data[1.week.ago.beginning_of_week.to_date.to_s]
      expect(one_week_ago_cohort_data['num_users_in_cohort']).to be(0)
      expect(one_week_ago_cohort_data['activity_periods'].keys.count).to be(2)
      expect(one_week_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(one_week_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(one_week_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(0)
      expect(one_week_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(1)

      two_weeks_ago_cohort_data = data[2.weeks.ago.beginning_of_week.to_date.to_s]
      expect(two_weeks_ago_cohort_data['num_users_in_cohort']).to be(2)
      expect(two_weeks_ago_cohort_data['activity_periods'].keys.count).to be(3)
      expect(two_weeks_ago_cohort_data['activity_periods'][2.weeks.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(2)
      expect(two_weeks_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(1)
      expect(two_weeks_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(two_weeks_ago_cohort_data['activity_periods'][2.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(0)
      expect(two_weeks_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(1)
      expect(two_weeks_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(2)
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

      data = described_class.get([my_public_key], events_to_be_considered_active: ['my_active_user_event'])
      expect(data.keys.count).to be(3)

      this_weeks_cohort_data = data[Time.current.beginning_of_week.to_date.to_s]
      expect(this_weeks_cohort_data['num_users_in_cohort']).to be(0)
      expect(this_weeks_cohort_data['activity_periods'].keys.count).to be(1)
      expect(this_weeks_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(this_weeks_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(0)

      one_week_ago_cohort_data = data[1.week.ago.beginning_of_week.to_date.to_s]
      expect(one_week_ago_cohort_data['num_users_in_cohort']).to be(0)
      expect(one_week_ago_cohort_data['activity_periods'].keys.count).to be(2)
      expect(one_week_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(one_week_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(one_week_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(0)
      expect(one_week_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(1)

      two_weeks_ago_cohort_data = data[2.weeks.ago.beginning_of_week.to_date.to_s]
      expect(two_weeks_ago_cohort_data['num_users_in_cohort']).to be(3)
      expect(two_weeks_ago_cohort_data['activity_periods'].keys.count).to be(3)
      expect(two_weeks_ago_cohort_data['activity_periods'][2.weeks.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(2)
      expect(two_weeks_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(1)
      expect(two_weeks_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(two_weeks_ago_cohort_data['activity_periods'][2.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(0)
      expect(two_weeks_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(1)
      expect(two_weeks_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(2)
    end

    it 'correctly buckets multiple cohorts and their activity data' do
      workspace = FactoryBot.create(:workspace)
      my_public_key = workspace.api_keys.first.public_key

      ##############################
      # START TWO WEEKS AGO COHORT #
      ##############################
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
      ############################
      # END TWO WEEKS AGO COHORT #
      ############################

      ################################
      # START THREE WEEKS AGO COHORT #
      ################################
      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 6, created_at: 3.weeks.ago, swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 6, device_identifier: 'device_6', swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 3.weeks.ago, properties: { device_identifier: 'device_6' }.to_json)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_6' }.to_json)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 1.week.ago, properties: { device_identifier: 'device_6' }.to_json)

      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 7, created_at: 3.weeks.ago, swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 7, device_identifier: 'device_7', swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_7' }.to_json)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 1.week.ago, properties: { device_identifier: 'device_7' }.to_json)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: Time.current, properties: { device_identifier: 'device_7' }.to_json)

      # no activity
      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 8, created_at: 3.weeks.ago, swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 8, device_identifier: 'device_8', swishjam_api_key: my_public_key)

      # activity but does not meet the `events_to_be_considered_active` parameter
      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 9, created_at: 3.weeks.ago, swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 9, device_identifier: 'device_9', swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_event, name: 'some other event!', swishjam_api_key: my_public_key, occurred_at: 3.weeks.ago, properties: { device_identifier: 'device_9' }.to_json)
      ##############################
      # END THREE WEEKS AGO COHORT #
      ##############################

      # this user should not be counted because their cohort is 5 weeks ago, which is outside of the 4 week window
      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 4, created_at: 5.weeks.ago, swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 4, device_identifier: 'device_4', swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 3.weeks.ago, properties: { device_identifier: 'device_4' }.to_json)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_4' }.to_json)

      # different workspaces should never be counted!
      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 5, created_at: 2.weeks.ago, swishjam_api_key: 'someone_else')
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 5, device_identifier: 'device_5', swishjam_api_key: 'someone_else')
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: 'someone_else', occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_5' }.to_json)

      data = described_class.get([my_public_key], events_to_be_considered_active: ['my_active_user_event'])
      expect(data.keys.count).to be(4)

      this_weeks_cohort_data = data[Time.current.beginning_of_week.to_date.to_s]
      expect(this_weeks_cohort_data['num_users_in_cohort']).to be(0)
      expect(this_weeks_cohort_data['activity_periods'].keys.count).to be(1)
      expect(this_weeks_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(this_weeks_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(0)

      one_week_ago_cohort_data = data[1.week.ago.beginning_of_week.to_date.to_s]
      expect(one_week_ago_cohort_data['num_users_in_cohort']).to be(0)
      expect(one_week_ago_cohort_data['activity_periods'].keys.count).to be(2)
      expect(one_week_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(one_week_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(one_week_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(0)
      expect(one_week_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(1)

      two_weeks_ago_cohort_data = data[2.weeks.ago.beginning_of_week.to_date.to_s]
      expect(two_weeks_ago_cohort_data['num_users_in_cohort']).to be(3)
      expect(two_weeks_ago_cohort_data['activity_periods'].keys.count).to be(3)
      expect(two_weeks_ago_cohort_data['activity_periods'][2.weeks.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(2)
      expect(two_weeks_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(1)
      expect(two_weeks_ago_cohort_data['activity_periods'][2.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(0)
      expect(two_weeks_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(1)
      expect(two_weeks_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(2)

      three_weeks_ago_cohort_data = data[3.weeks.ago.beginning_of_week.to_date.to_s]
      expect(three_weeks_ago_cohort_data['num_users_in_cohort']).to be(4)
      expect(three_weeks_ago_cohort_data['activity_periods'].keys.count).to be(4)
      expect(three_weeks_ago_cohort_data['activity_periods'][3.weeks.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(1)
      expect(three_weeks_ago_cohort_data['activity_periods'][2.weeks.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(2)
      expect(three_weeks_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(2)
      expect(three_weeks_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_active_users']).to be(1)
      expect(three_weeks_ago_cohort_data['activity_periods'][3.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(0)
      expect(three_weeks_ago_cohort_data['activity_periods'][2.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(1)
      expect(three_weeks_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(2)
      expect(three_weeks_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(3)
    end

    it 'returns the cohorts dating back to the oldest_cohort_date parameter' do
      workspace = FactoryBot.create(:workspace)
      my_public_key = workspace.api_keys.first.public_key

      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 1, created_at: 2.weeks.ago, swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 1, device_identifier: 'device_1', swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_1' }.to_json)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 1.week.ago, properties: { device_identifier: 'device_1' }.to_json)

      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 2, created_at: 2.weeks.ago, swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 2, device_identifier: 'device_2', swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_2' }.to_json)

      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 3, created_at: 5.weeks.ago, swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 3, device_identifier: 'device_3', swishjam_api_key: my_public_key)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 3.weeks.ago, properties: { device_identifier: 'device_3' }.to_json)
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: my_public_key, occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_3' }.to_json)

      # different workspaces should never be counted!
      FactoryBot.create(:analytics_swishjam_user_profile, swishjam_user_id: 4, created_at: 2.weeks.ago, swishjam_api_key: 'someone_else')
      FactoryBot.create(:analytics_user_identify_event, swishjam_user_id: 4, device_identifier: 'device_3', swishjam_api_key: 'someone_else')
      FactoryBot.create(:analytics_event, name: 'my_active_user_event', swishjam_api_key: 'someone_else', occurred_at: 2.weeks.ago, properties: { device_identifier: 'device_3' }.to_json)

      data = described_class.get([my_public_key], oldest_cohort_date: 5.weeks.ago)
      expect(data.keys.count).to be(6)

      this_weeks_cohort_data = data[Time.current.beginning_of_week.to_date.to_s]
      expect(this_weeks_cohort_data['num_users_in_cohort']).to be(0)
      expect(this_weeks_cohort_data['activity_periods'].keys.count).to be(1)
      expect(this_weeks_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(this_weeks_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(0)

      one_week_ago_cohort_data = data[1.week.ago.beginning_of_week.to_date.to_s]
      expect(one_week_ago_cohort_data['num_users_in_cohort']).to be(0)
      expect(one_week_ago_cohort_data['activity_periods'].keys.count).to be(2)
      expect(one_week_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(one_week_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(one_week_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(0)
      expect(one_week_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(1)

      two_weeks_ago_cohort_data = data[2.weeks.ago.beginning_of_week.to_date.to_s]
      expect(two_weeks_ago_cohort_data['num_users_in_cohort']).to be(2)
      expect(two_weeks_ago_cohort_data['activity_periods'].keys.count).to be(3)
      expect(two_weeks_ago_cohort_data['activity_periods'][2.weeks.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(2)
      expect(two_weeks_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(1)
      expect(two_weeks_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(two_weeks_ago_cohort_data['activity_periods'][2.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(0)
      expect(two_weeks_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(1)
      expect(two_weeks_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(2)

      three_weeks_ago_cohort_data = data[3.weeks.ago.beginning_of_week.to_date.to_s]
      expect(three_weeks_ago_cohort_data['num_users_in_cohort']).to be(0)
      expect(three_weeks_ago_cohort_data['activity_periods'].keys.count).to be(4)
      expect(three_weeks_ago_cohort_data['activity_periods'][3.weeks.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(three_weeks_ago_cohort_data['activity_periods'][2.weeks.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(three_weeks_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(three_weeks_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(three_weeks_ago_cohort_data['activity_periods'][3.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(0)
      expect(three_weeks_ago_cohort_data['activity_periods'][2.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(1)
      expect(three_weeks_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(2)
      expect(three_weeks_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(3)

      four_weeks_ago_cohort_data = data[4.weeks.ago.beginning_of_week.to_date.to_s]
      expect(four_weeks_ago_cohort_data['num_users_in_cohort']).to be(0)
      expect(four_weeks_ago_cohort_data['activity_periods'].keys.count).to be(5)
      expect(four_weeks_ago_cohort_data['activity_periods'][4.weeks.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(four_weeks_ago_cohort_data['activity_periods'][3.weeks.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(four_weeks_ago_cohort_data['activity_periods'][2.weeks.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(four_weeks_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(four_weeks_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(four_weeks_ago_cohort_data['activity_periods'][4.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(0)
      expect(four_weeks_ago_cohort_data['activity_periods'][3.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(1)
      expect(four_weeks_ago_cohort_data['activity_periods'][2.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(2)
      expect(four_weeks_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(3)
      expect(four_weeks_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(4)

      five_weeks_ago_cohort_data = data[5.weeks.ago.beginning_of_week.to_date.to_s]
      expect(five_weeks_ago_cohort_data['num_users_in_cohort']).to be(1)
      expect(five_weeks_ago_cohort_data['activity_periods'].keys.count).to be(6)
      expect(five_weeks_ago_cohort_data['activity_periods'][5.weeks.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(five_weeks_ago_cohort_data['activity_periods'][4.weeks.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(five_weeks_ago_cohort_data['activity_periods'][3.weeks.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(1)
      expect(five_weeks_ago_cohort_data['activity_periods'][2.weeks.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(1)
      expect(five_weeks_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(five_weeks_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_active_users']).to be(0)
      expect(five_weeks_ago_cohort_data['activity_periods'][5.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(0)
      expect(five_weeks_ago_cohort_data['activity_periods'][4.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(1)
      expect(five_weeks_ago_cohort_data['activity_periods'][3.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(2)
      expect(five_weeks_ago_cohort_data['activity_periods'][2.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(3)
      expect(five_weeks_ago_cohort_data['activity_periods'][1.week.ago.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(4)
      expect(five_weeks_ago_cohort_data['activity_periods'][Time.current.beginning_of_week.to_date.to_s]['num_periods_after_cohort']).to be(5)
    end
  end
end