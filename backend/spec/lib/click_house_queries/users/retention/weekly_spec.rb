require 'spec_helper'

describe ClickHouseQueries::Users::Retention::Weekly do
  describe '#get' do
    it 'calculates weekly retention' do
      workspace = FactoryBot.create(:workspace)
      my_public_key = workspace.api_keys.first.public_key
      someone_elses_api_key = 'someone_elses_api_key'
      three_months_ago_date = 3.months.ago
      two_months_ago_date = 2.months.ago

      sept_1_user_1 = FactoryBot.create(:swishjam_user_profile, created_at: three_months_ago_date, swishjam_api_key: my_public_key)
      sept_1_user_2 = FactoryBot.create(:swishjam_user_profile, created_at: three_months_ago_date, swishjam_api_key: my_public_key)
      oct_1_user_1 = FactoryBot.create(:swishjam_user_profile, created_at: two_months_ago_date, swishjam_api_key: my_public_key)
      a_user_for_a_different_workspace = FactoryBot.create(:swishjam_user_profile, created_at: three_months_ago_date, swishjam_api_key: someone_elses_api_key)

      sept_1_user_1_device_id = 'sept_1_user_1_device_identifier'
      FactoryBot.create(:analytics_event, swishjam_api_key: my_public_key, occurred_at: three_months_ago_date, properties: { device_identifier: sept_1_user_1_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: my_public_key, occurred_at: three_months_ago_date + 1.week, properties: { device_identifier: sept_1_user_1_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: my_public_key, occurred_at: three_months_ago_date + 2.weeks, properties: { device_identifier: sept_1_user_1_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: my_public_key, occurred_at: three_months_ago_date + 3.weeks, properties: { device_identifier: sept_1_user_1_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: my_public_key, occurred_at: three_months_ago_date + 4.weeks, properties: { device_identifier: sept_1_user_1_device_id })
      FactoryBot.create(:analytics_user_identify_event, swishjam_api_key: my_public_key, swishjam_user_id: sept_1_user_1.swishjam_user_id, device_identifier: sept_1_user_1_device_id)

      sept_1_user_2_device_id = 'sept_1_user_2_device_identifier'
      FactoryBot.create(:analytics_event, swishjam_api_key: my_public_key, occurred_at: three_months_ago_date, properties: { device_identifier: sept_1_user_2_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: my_public_key, occurred_at: three_months_ago_date + 1.week, properties: { device_identifier: sept_1_user_2_device_id })
      FactoryBot.create(:analytics_user_identify_event, swishjam_api_key: my_public_key, swishjam_user_id: sept_1_user_2.swishjam_user_id, device_identifier: sept_1_user_2_device_id)

      oct_1_user_1_device_id = 'oct_1_user_1_device_id_device_identifier'
      FactoryBot.create(:analytics_event, swishjam_api_key: my_public_key, occurred_at: two_months_ago_date, properties: { device_identifier: oct_1_user_1_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: my_public_key, occurred_at: two_months_ago_date + 1.week, properties: { device_identifier: oct_1_user_1_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: my_public_key, occurred_at: two_months_ago_date + 2.weeks, properties: { device_identifier: oct_1_user_1_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: my_public_key, occurred_at: two_months_ago_date + 3.weeks, properties: { device_identifier: oct_1_user_1_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: my_public_key, occurred_at: two_months_ago_date + 4.weeks, properties: { device_identifier: oct_1_user_1_device_id })
      FactoryBot.create(:analytics_user_identify_event, swishjam_api_key: my_public_key, swishjam_user_id: oct_1_user_1.swishjam_user_id, device_identifier: oct_1_user_1_device_id)

      different_workspace_user_device_id = 'different_workspace_device_identifier'
      FactoryBot.create(:analytics_event, swishjam_api_key: someone_elses_api_key, occurred_at: three_months_ago_date, properties: { device_identifier: different_workspace_user_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: someone_elses_api_key, occurred_at: three_months_ago_date + 1.week, properties: { device_identifier: different_workspace_user_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: someone_elses_api_key, occurred_at: three_months_ago_date + 2.weeks, properties: { device_identifier: different_workspace_user_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: someone_elses_api_key, occurred_at: three_months_ago_date + 3.weeks, properties: { device_identifier: different_workspace_user_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: someone_elses_api_key, occurred_at: three_months_ago_date + 4.weeks, properties: { device_identifier: different_workspace_user_device_id })
      FactoryBot.create(:analytics_user_identify_event, swishjam_api_key: someone_elses_api_key, swishjam_user_id: a_user_for_a_different_workspace.swishjam_user_id, device_identifier: different_workspace_user_device_id)
      
      data = ClickHouseQueries::Users::Retention::Weekly.new(
        [my_public_key], 
        oldest_cohort_date: three_months_ago_date, 
        oldest_activity_week: three_months_ago_date
      ).get
      expect(data.keys.count).to be(2)
      expect(data.keys.sort).to eq([three_months_ago_date.beginning_of_week.to_date.to_s, two_months_ago_date.beginning_of_week.to_date.to_s])
      
      three_months_ago_cohort_results = data[three_months_ago_date.beginning_of_week.to_date.to_s]
      expect(three_months_ago_cohort_results[:cohort_size]).to be(2)

      three_months_ago_cohort_0_periods_after_start = three_months_ago_cohort_results[:activity_periods][three_months_ago_date.beginning_of_week.to_date.to_s]
      expect(three_months_ago_cohort_0_periods_after_start[:num_active_users]).to be(2)
      expect(three_months_ago_cohort_0_periods_after_start[:num_periods_after_cohort]).to be(0)

      three_months_ago_cohort_1_period_after_start = three_months_ago_cohort_results[:activity_periods][(three_months_ago_date + 1.week).beginning_of_week.to_date.to_s]
      expect(three_months_ago_cohort_1_period_after_start[:num_active_users]).to be(2)
      expect(three_months_ago_cohort_1_period_after_start[:num_periods_after_cohort]).to be(1)

      three_months_ago_cohort_2_periods_after_start = three_months_ago_cohort_results[:activity_periods][(three_months_ago_date + 2.weeks).beginning_of_week.to_date.to_s]
      expect(three_months_ago_cohort_2_periods_after_start[:num_active_users]).to be(1)
      expect(three_months_ago_cohort_2_periods_after_start[:num_periods_after_cohort]).to be(2)

      three_months_ago_cohort_3_periods_after_start = three_months_ago_cohort_results[:activity_periods][(three_months_ago_date + 3.weeks).beginning_of_week.to_date.to_s]
      expect(three_months_ago_cohort_3_periods_after_start[:num_active_users]).to be(1)
      expect(three_months_ago_cohort_3_periods_after_start[:num_periods_after_cohort]).to be(3)

      three_months_ago_cohort_4_periods_after_start = three_months_ago_cohort_results[:activity_periods][(three_months_ago_date + 4.weeks).beginning_of_week.to_date.to_s]
      expect(three_months_ago_cohort_4_periods_after_start[:num_active_users]).to be(1)
      expect(three_months_ago_cohort_4_periods_after_start[:num_periods_after_cohort]).to be(4)

      two_months_ago_cohort_results = data[two_months_ago_date.beginning_of_week.to_date.to_s]
      expect(two_months_ago_cohort_results[:cohort_size]).to be(1)

      two_months_ago_cohort_0_periods_after_start = two_months_ago_cohort_results[:activity_periods][two_months_ago_date.beginning_of_week.to_date.to_s]
      expect(two_months_ago_cohort_0_periods_after_start[:num_active_users]).to be(1)
      expect(two_months_ago_cohort_0_periods_after_start[:num_periods_after_cohort]).to be(0)

      two_months_ago_cohort_1_period_after_start = two_months_ago_cohort_results[:activity_periods][(two_months_ago_date + 1.week).beginning_of_week.to_date.to_s]
      expect(two_months_ago_cohort_1_period_after_start[:num_active_users]).to be(1)
      expect(two_months_ago_cohort_1_period_after_start[:num_periods_after_cohort]).to be(1)

      two_months_ago_cohort_2_periods_after_start = two_months_ago_cohort_results[:activity_periods][(two_months_ago_date + 2.weeks).beginning_of_week.to_date.to_s]
      expect(two_months_ago_cohort_2_periods_after_start[:num_active_users]).to be(1)
      expect(two_months_ago_cohort_2_periods_after_start[:num_periods_after_cohort]).to be(2)

      two_months_ago_cohort_3_periods_after_start = two_months_ago_cohort_results[:activity_periods][(two_months_ago_date + 3.weeks).beginning_of_week.to_date.to_s]
      expect(two_months_ago_cohort_3_periods_after_start[:num_active_users]).to be(1)
      expect(two_months_ago_cohort_3_periods_after_start[:num_periods_after_cohort]).to be(3)

      two_months_ago_cohort_4_periods_after_start = two_months_ago_cohort_results[:activity_periods][(two_months_ago_date + 4.weeks).beginning_of_week.to_date.to_s]
      expect(two_months_ago_cohort_4_periods_after_start[:num_active_users]).to be(1)
      expect(two_months_ago_cohort_4_periods_after_start[:num_periods_after_cohort]).to be(4)
    end
    
    it 'returns nothing when theres no users' do
      data = ClickHouseQueries::Users::Retention::Weekly.new(['STUB!']).get
      expect(data).to eq({})
    end
  end
end