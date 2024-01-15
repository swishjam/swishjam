require 'spec_helper'

RSpec.describe ClickHouseQueries::SaasMetrics::Mrr::Timeseries do
  describe '#get' do
    it 'returns the filled in results' do
      my_api_key = 'xyz'
      FactoryBot.create(:analytics_event, 
        name: Analytics::Event::ReservedNames.MRR_MOVEMENT, 
        swishjam_api_key: my_api_key, 
        occurred_at: 1.day.ago, 
        properties: { movement_amount: 100, movement_type: 'new' }.to_json
      )
      FactoryBot.create(:analytics_event,
        name: Analytics::Event::ReservedNames.MRR_MOVEMENT,
        swishjam_api_key: my_api_key,
        occurred_at: 35.days.ago,
        properties: { movement_amount: 100, movement_type: 'new' }.to_json
      )
      FactoryBot.create(:analytics_event,
        name: Analytics::Event::ReservedNames.MRR_MOVEMENT,
        swishjam_api_key: my_api_key,
        occurred_at: 15.days.ago,
        properties: { movement_amount: -50, movement_type: 'churn' }.to_json
      )
      timeseries_data = described_class.new(my_api_key, start_time: 30.days.ago, end_time: Time.current).get
      expect(timeseries_data.count).to eq(31)
      expect(timeseries_data.first['group_by_date'].to_datetime).to eq(30.days.ago.beginning_of_day.to_datetime)
      expect(timeseries_data.first['mrr']).to eq(100)

      churn_date_index = timeseries_data.index{ |result| result['group_by_date'].to_datetime == 15.days.ago.beginning_of_day.to_datetime }
      churn_date_result = timeseries_data[churn_date_index]
      day_before_churn_date_result = timeseries_data[churn_date_index - 1]
      expect(churn_date_result['mrr']).to eq(50)
      expect(day_before_churn_date_result['mrr']).to eq(100)

      yesterday_result = timeseries_data.find{ |result| result['group_by_date'].to_datetime == 1.day.ago.beginning_of_day.to_datetime }
      expect(yesterday_result['mrr']).to eq(150)
    end

    it 'returns 0s when there is no date for a given day within the buffer zone' do
      my_api_key = 'xyz'
      FactoryBot.create(:analytics_event, 
        name: Analytics::Event::ReservedNames.MRR_MOVEMENT, 
        swishjam_api_key: my_api_key, 
        occurred_at: 1.day.ago, 
        properties: { movement_amount: 100, movement_type: 'new' }.to_json
      )
      FactoryBot.create(:analytics_event,
        name: Analytics::Event::ReservedNames.MRR_MOVEMENT,
        swishjam_api_key: my_api_key,
        occurred_at: 15.days.ago,
        properties: { movement_amount: -50, movement_type: 'churn' }.to_json
      )
      timeseries_data = described_class.new(my_api_key, start_time: 30.days.ago, end_time: Time.current).get
      expect(timeseries_data.count).to eq(31)
      expect(timeseries_data.first['group_by_date'].to_datetime).to eq(30.days.ago.beginning_of_day.to_datetime)
      expect(timeseries_data.first['mrr']).to eq(0)

      churn_date_index = timeseries_data.index{ |result| result['group_by_date'].to_datetime == 15.days.ago.beginning_of_day.to_datetime }
      churn_date_result = timeseries_data[churn_date_index]
      day_before_churn_date_result = timeseries_data[churn_date_index - 1]
      expect(churn_date_result['mrr']).to eq(-50)
      expect(day_before_churn_date_result['mrr']).to eq(0)

      yesterday_result = timeseries_data.find{ |result| result['group_by_date'].to_datetime == 1.day.ago.beginning_of_day.to_datetime }
      expect(yesterday_result['mrr']).to eq(50)
    end
  end
end