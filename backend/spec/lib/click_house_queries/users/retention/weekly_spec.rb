require 'spec_helper'

describe ClickHouseQueries::Users::Retention::Weekly do
  describe '#get' do
    it 'calculates weekly retention' do
      workspace = FactoryBot.create(:workspace)
      someone_elses_workspace = FactoryBot.create(:workspace)
      user_1 = FactoryBot.create(:analytics_user_profile, created_at: 4.weeks.ago, workspace: workspace)
      user_2 = FactoryBot.create(:analytics_user_profile, created_at: 4.weeks.ago, user_unique_identifier: 'something', email: 'dude@gmail.com', workspace: workspace)
      a_user_for_a_different_workspace = FactoryBot.create(:analytics_user_profile, created_at: 3.weeks.ago, workspace: someone_elses_workspace)

      public_keys = workspace.api_keys.pluck(:public_key)

      user_1_device_id = 'user_1_device_identifier'
      FactoryBot.create(:analytics_event, swishjam_api_key: public_keys.first, occurred_at: 4.weeks.ago, properties: { device_identifier: user_1_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: public_keys.first, occurred_at: 3.weeks.ago, properties: { device_identifier: user_1_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: public_keys.first, occurred_at: 2.weeks.ago, properties: { device_identifier: user_1_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: public_keys.first, occurred_at: 1.weeks.ago, properties: { device_identifier: user_1_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: public_keys.first, occurred_at: Time.current, properties: { device_identifier: user_1_device_id })
      FactoryBot.create(:analytics_user_identify_event, swishjam_api_key: public_keys.first, swishjam_user_id: user_1.id, device_identifier: user_1_device_id)

      user_2_device_id = 'user_2_device_identifier'
      FactoryBot.create(:analytics_event, swishjam_api_key: public_keys.first, occurred_at: 4.weeks.ago, properties: { device_identifier: user_2_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: public_keys.first, occurred_at: 3.weeks.ago, properties: { device_identifier: user_2_device_id })
      FactoryBot.create(:analytics_user_identify_event, swishjam_api_key: public_keys.first, swishjam_user_id: user_2.id, device_identifier: user_2_device_id)

      different_workspace_user_device_id = 'different_workspace_device_identifier'
      FactoryBot.create(:analytics_event, swishjam_api_key: someone_elses_workspace.api_keys.first.public_key, occurred_at: 4.weeks.ago, properties: { device_identifier: different_workspace_user_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: someone_elses_workspace.api_keys.first.public_key, occurred_at: 3.weeks.ago, properties: { device_identifier: different_workspace_user_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: someone_elses_workspace.api_keys.first.public_key, occurred_at: 2.weeks.ago, properties: { device_identifier: different_workspace_user_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: someone_elses_workspace.api_keys.first.public_key, occurred_at: 1.weeks.ago, properties: { device_identifier: different_workspace_user_device_id })
      FactoryBot.create(:analytics_event, swishjam_api_key: someone_elses_workspace.api_keys.first.public_key, occurred_at: Time.current, properties: { device_identifier: different_workspace_user_device_id })
      FactoryBot.create(:analytics_user_identify_event, swishjam_api_key: someone_elses_workspace.api_keys.first.public_key, swishjam_user_id: a_user_for_a_different_workspace.id, device_identifier: different_workspace_user_device_id)
      
      data = ClickHouseQueries::Users::Retention::Weekly.new(public_keys).get
      expect(data.collect{ |d| d[:cohort_date] }.uniq.count).to be(1)
      
      four_weeks_ago_retention = data.find{ |d| d[:retention_week].to_date == 4.weeks.ago.beginning_of_week.to_date && d[:cohort].to_date == 4.weeks.ago.beginning_of_week.to_date }
      expect(four_weeks_ago_retention[:cohort_size]).to be(2)
      expect(four_weeks_ago_retention[:num_active_users]).to be(2)

      three_weeks_ago_retention = data.find{ |d| d[:retention_week].to_date == 3.weeks.ago.beginning_of_week.to_date && d[:cohort].to_date == 4.weeks.ago.beginning_of_week.to_date }
      expect(three_weeks_ago_retention[:cohort_size]).to be(2)
      expect(three_weeks_ago_retention[:num_active_users]).to be(2)

      two_weeks_ago_retention = data.find{ |d| d[:retention_week].to_date == 2.weeks.ago.beginning_of_week.to_date && d[:cohort].to_date == 4.weeks.ago.beginning_of_week.to_date }
      expect(two_weeks_ago_retention[:cohort_size]).to be(2)
      expect(two_weeks_ago_retention[:num_active_users]).to be(1)

      one_week_ago_retention = data.find{ |d| d[:retention_week].to_date == 1.week.ago.beginning_of_week.to_date && d[:cohort].to_date == 4.weeks.ago.beginning_of_week.to_date }
      expect(one_week_ago_retention[:cohort_size]).to be(2)
      expect(one_week_ago_retention[:num_active_users]).to be(1)

      this_weeks_retention = data.find{ |d| d[:retention_week].to_date == Time.current.beginning_of_week.to_date && d[:cohort].to_date == 4.weeks.ago.beginning_of_week.to_date }
      expect(one_week_ago_retention[:cohort_size]).to be(2)
      expect(one_week_ago_retention[:num_active_users]).to be(1)
    end
  end
end