require 'spec_helper'

describe ClickHouseQueries::Users::Active::Timeseries::Daily do
  describe '#get' do
    it 'only includes data from the specified workspace' do
      FactoryBot.create(:analytics_event, analytics_family: 'product', swishjam_api_key: 'my_workspace')
      FactoryBot.create(:analytics_event, analytics_family: 'product', swishjam_api_key: 'someone_elses_workspace')

      daily = ClickHouseQueries::Users::Active::Timeseries::Daily.new('my_workspace')
      expect(daily.timeseries.filled_in_data.collect{ |h| h[:value] }.sum).to eq(1)
    end

    it 'only includes data from the specified time range' do
      FactoryBot.create(:analytics_event, analytics_family: 'product', swishjam_api_key: 'my_workspace', occurred_at: 1.day.ago)
      FactoryBot.create(:analytics_event, analytics_family: 'product', swishjam_api_key: 'my_workspace', occurred_at: 3.days.ago)

      daily = ClickHouseQueries::Users::Active::Timeseries::Daily.new('my_workspace', start_time: 1.days.ago)
      expect(daily.timeseries.filled_in_data.collect{ |h| h[:value] }.sum).to eq(1)
    end

    it 'correctly counts unique users' do
      FactoryBot.create(:analytics_event, 
        name: 'some random event', 
        analytics_family: 'product', 
        swishjam_api_key: 'my_workspace', 
        occurred_at: 7.days.ago,
        properties: { device_identifier: 'anon-user' }
      )
      
      FactoryBot.create(:analytics_event, 
        name: 'some random event', 
        analytics_family: 'product', 
        swishjam_api_key: 'my_workspace', 
        occurred_at: 1.day.ago,
        properties: { device_identifier: 'user-1-device-1' }
      )
      FactoryBot.create(:analytics_event, 
        name: 'some random event', 
        analytics_family: 'product', 
        swishjam_api_key: 'my_workspace', 
        occurred_at: 7.days.ago,
        properties: { device_identifier: 'user-1-device-2' }
      )
      FactoryBot.create(:analytics_event, 
        name: 'some random event', 
        analytics_family: 'marketing', 
        swishjam_api_key: 'my_workspace', 
        occurred_at: 1.day.ago,
        properties: { device_identifier: 'another-anonymous-event-for-marketing' }
      )
      
      # an identify event from the same device for a different user in the past
      FactoryBot.create(:analytics_user_identify_event, swishjam_api_key: 'my_workspace', device_identifier: 'user-1-device-1', swishjam_user_id: 'user-8', occurred_at: 1.week.ago)
      FactoryBot.create(:analytics_user_identify_event, swishjam_api_key: 'my_workspace', device_identifier: 'user-1-device-1', swishjam_user_id: 'user-1')
      FactoryBot.create(:analytics_user_identify_event, swishjam_api_key: 'my_workspace', device_identifier: 'user-1-device-2', swishjam_user_id: 'user-1')

      daily = ClickHouseQueries::Users::Active::Timeseries::Daily.new('my_workspace')
      
      expect(daily.timeseries.filled_in_data.collect{ |h| h[:value] }.sum).to eq(3)
      active_users_7_days_ago = daily.timeseries.filled_in_data.find{ |h| h[:date] == 7.days.ago.beginning_of_day.to_date }
      active_users_1_day_ago = daily.timeseries.filled_in_data.find{ |h| h[:date] == 1.day.ago.beginning_of_day.to_date }
      expect(active_users_7_days_ago[:value]).to eq(2)
      expect(active_users_1_day_ago[:value]).to eq(1)
    end
  end
end