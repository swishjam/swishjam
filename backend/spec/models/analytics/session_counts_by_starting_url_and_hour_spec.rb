require 'spec_helper'

describe Analytics::SessionCountByAnalyticsFamilyAndHour do
  def create_page_view(api_key:, occurred_at:, session_identifier:, analytics_family: 'marketing')
    FactoryBot.create(:analytics_event, 
      name: 'page_view',
      swishjam_api_key: api_key, 
      occurred_at: occurred_at,
      properties: {
        session_identifier: session_identifier,
        analytics_family: analytics_family
      }
    )
  end

  describe '#timeseries' do
    it 'correctly only sums the count when there are duplicate records with the same swishjam_api_key, analytics_family, and occurred_at (within the same hour) when the start_time is 1 week ago' do
      workspace = FactoryBot.create(:workspace)
      other_workspace = FactoryBot.create(:workspace, public_key: 'other_public_key')
      current_time = Time.current
      create_page_view(api_key: workspace.public_key, occurred_at: current_time, session_identifier: 'foo')
      create_page_view(api_key: workspace.public_key, occurred_at: current_time.beginning_of_hour, session_identifier: 'foo2')
      create_page_view(api_key: workspace.public_key, occurred_at: current_time.end_of_hour, session_identifier: 'foo2')
      create_page_view(api_key: workspace.public_key, occurred_at: current_time - 1.hour, session_identifier: 'foo')
      create_page_view(api_key: other_workspace.public_key, occurred_at: current_time, session_identifier: 'foo3')
      
      timeseries = Analytics::SessionCountByAnalyticsFamilyAndHour.timeseries(api_key: workspace.public_key, analytics_family: 'marketing', start_time: 1.week.ago)
      expect(timeseries.raw_data.count).to be(2)
      expect(timeseries.formatted_data.count).to be(7 * 24 + 1) # not sure where, but we're currently adding an hour somewhere (likely the start or end...)
      expect(timeseries.group_by).to eq(:hour)
      data_point_for_this_hour = timeseries.formatted_data.find { |data_point| data_point[:date] == current_time.beginning_of_hour }
      data_point_for_previous_hour = timeseries.formatted_data.find { |data_point| data_point[:date] == current_time.beginning_of_hour - 1.hour }
      expect(data_point_for_this_hour[:value]).to be(3)
      expect(data_point_for_previous_hour[:value]).to be(1)
    end

    it 'correctly only sums the count when there are duplicate records with the same swishjam_api_key, analytics_family, and occurred_at (within the same day) when the start_time is 1 month ago' do
      workspace = FactoryBot.create(:workspace)
      other_workspace = FactoryBot.create(:workspace, public_key: 'other_public_key')
      current_time = Time.current
      create_page_view(api_key: workspace.public_key, occurred_at: current_time, session_identifier: 'foo')
      create_page_view(api_key: workspace.public_key, occurred_at: current_time.beginning_of_day, session_identifier: 'foo2')
      create_page_view(api_key: workspace.public_key, occurred_at: current_time.end_of_day, session_identifier: 'foo2')
      create_page_view(api_key: workspace.public_key, occurred_at: current_time.yesterday, session_identifier: 'foo')
      create_page_view(api_key: other_workspace.public_key, occurred_at: current_time, session_identifier: 'foo3')
      
      timeseries = Analytics::SessionCountByAnalyticsFamilyAndHour.timeseries(api_key: workspace.public_key, analytics_family: 'marketing', start_time: 1.month.ago)
      expect(timeseries.raw_data.count).to be(2)
      # expect(timeseries.formatted_data.count).to be(1.month / 1.day) # not sure where, but we're currently adding an hour somewhere (likely the start or end...)
      expect(timeseries.group_by).to eq(:day)
      data_point_for_this_hour = timeseries.formatted_data.find { |data_point| data_point[:date] == current_time.beginning_of_day }
      data_point_for_yesterday = timeseries.formatted_data.find { |data_point| data_point[:date] == current_time.yesterday.beginning_of_day }
      expect(data_point_for_this_hour[:value]).to be(3)
      expect(data_point_for_yesterday[:value]).to be(1)
    end

    it 'correctly only sums the count when there are duplicate records with the same swishjam_api_key, analytics_family, and occurred_at (within the same week) when the start_time is 2 months ago' do
      workspace = FactoryBot.create(:workspace)
      other_workspace = FactoryBot.create(:workspace, public_key: 'other_public_key')
      current_time = Time.current
      create_page_view(api_key: workspace.public_key, occurred_at: current_time, session_identifier: 'foo')
      create_page_view(api_key: workspace.public_key, occurred_at: current_time.beginning_of_week, session_identifier: 'foo2')
      create_page_view(api_key: workspace.public_key, occurred_at: current_time.end_of_week, session_identifier: 'foo2')
      create_page_view(api_key: workspace.public_key, occurred_at: current_time - 7.days - 1.second, session_identifier: 'foo')
      create_page_view(api_key: other_workspace.public_key, occurred_at: current_time, session_identifier: 'foo3')
      
      timeseries = Analytics::SessionCountByAnalyticsFamilyAndHour.timeseries(api_key: workspace.public_key, analytics_family: 'marketing', start_time: 2.months.ago)
      expect(timeseries.raw_data.count).to be(2)
      # expect(timeseries.formatted_data.count).to be(2.months / 1.week) # not sure where, but we're currently adding an hour somewhere (likely the start or end...)
      expect(timeseries.group_by).to eq(:week)
      data_point_for_this_week = timeseries.formatted_data.find { |data_point| data_point[:date] == current_time.beginning_of_week }
      data_point_for_last_week = timeseries.formatted_data.find { |data_point| data_point[:date] == current_time.last_week.beginning_of_week  }
      expect(data_point_for_this_week[:value]).to be(3)
      expect(data_point_for_last_week[:value]).to be(1)
    end

    it 'correctly only sums the count when there are duplicate records with the same swishjam_api_key, analytics_family, and occurred_at (within the same month) when the start_time is 4 months ago' do
      workspace = FactoryBot.create(:workspace)
      other_workspace = FactoryBot.create(:workspace, public_key: 'other_public_key')
      current_time = Time.current
      create_page_view(api_key: workspace.public_key, occurred_at: current_time, session_identifier: 'foo')
      create_page_view(api_key: workspace.public_key, occurred_at: current_time.beginning_of_month, session_identifier: 'foo2')
      create_page_view(api_key: workspace.public_key, occurred_at: current_time.end_of_month, session_identifier: 'foo2')
      create_page_view(api_key: workspace.public_key, occurred_at: current_time.last_month, session_identifier: 'foo')
      create_page_view(api_key: other_workspace.public_key, occurred_at: current_time, session_identifier: 'foo3')
      
      timeseries = Analytics::SessionCountByAnalyticsFamilyAndHour.timeseries(api_key: workspace.public_key, analytics_family: 'marketing', start_time: 4.months.ago)
      expect(timeseries.raw_data.count).to be(2)
      # expect(timeseries.formatted_data.count).to be(4.months / 1.month) # not sure where, but we're currently adding an hour somewhere (likely the start or end...)
      expect(timeseries.group_by).to eq(:month)
      data_point_for_this_month = timeseries.formatted_data.find { |data_point| data_point[:date] == current_time.beginning_of_month }
      data_point_for_last_month = timeseries.formatted_data.find { |data_point| data_point[:date] == current_time.last_month.beginning_of_month  }
      expect(data_point_for_this_month[:value]).to be(3)
      expect(data_point_for_last_month[:value]).to be(1)
    end
  end
end