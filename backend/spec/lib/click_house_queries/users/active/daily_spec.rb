require 'spec_helper'

describe ClickHouseQueries::Users::Active::Daily do
  describe '#get' do
    it 'only includes data from the specified workspace' do
      FactoryBot.create(:analytics_event, swishjam_api_key: 'my_workspace')
      FactoryBot.create(:analytics_event, swishjam_api_key: 'someone_elses_workspace')

      daily = ClickHouseQueries::Users::Active::Daily.new('my_workspace')
      expect(daily.timeseries.collect{ |h| h[:value] }.sum).to eq(1)
    end

    it 'only includes data from the specified time range' do
      FactoryBot.create(:analytics_event, swishjam_api_key: 'my_workspace', occurred_at: 1.day.ago)
      FactoryBot.create(:analytics_event, swishjam_api_key: 'my_workspace', occurred_at: 3.days.ago)

      daily = ClickHouseQueries::Users::Active::Daily.new('my_workspace', start_time: 1.days.ago)
      expect(daily.timeseries.collect{ |h| h[:value] }.sum).to eq(1)
    end

    it 'correctly counts unique users' do
      FactoryBot.create(:analytics_event, swishjam_api_key: 'my_workspace', device_identifier: 'anon-user')
      
      FactoryBot.create(:analytics_event, swishjam_api_key: 'my_workspace', device_identifier: 'user-1-device-1')
      FactoryBot.create(:analytics_event, swishjam_api_key: 'my_workspace', device_identifier: 'user-1-device-2')
      
      FactoryBot.create(:analytics_user_identify_event, device_identifier: 'user-1-device-1', swishjam_user_id: 'user-1')
      FactoryBot.create(:analytics_user_identify_event, device_identifier: 'user-1-device-2', swishjam_user_id: 'user-1')

      daily = ClickHouseQueries::Users::Active::Daily.new('my_workspace')
      expect(daily.timeseries.collect{ |h| h[:value] }.sum).to eq(2)
    end
  end
end