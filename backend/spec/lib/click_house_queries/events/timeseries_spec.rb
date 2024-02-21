require 'spec_helper'

describe ClickHouseQueries::Events::Timeseries do
  before do
    @public_key = 'my_public_key'
    @frozen_time = Time.parse('2021-01-01 12:00:00 GMT').to_datetime
  end

  describe '#get' do
    it 'returns a timeseries of the specified event based on when they occurred' do
      Analytics::Event.insert_all!([
        { uuid: '1', name: 'event_1', properties: {}.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 1.hour, ingested_at: @frozen_time },
        { uuid: '2', name: 'event_1', properties: {}.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 1.day, ingested_at: @frozen_time },
        { uuid: '3', name: 'event_1', properties: {}.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 1.day, ingested_at: @frozen_time },
        # different api key
        { uuid: '4', name: 'event_1', properties: {}.to_json, swishjam_api_key: 'different!', occurred_at: @frozen_time - 1.day, ingested_at: @frozen_time },
        # outside of the time range
        { uuid: '5', name: 'event_1', properties: {}.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 3.days, ingested_at: @frozen_time },
        { uuid: '6', name: 'a_different_event', properties: {}.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 3.days, ingested_at: @frozen_time },
      ])

      Analytics::Event.insert_all!([
        # does not use this one because its not unique and was ingested before the other
        { uuid: '3', name: 'event_1', properties: {}.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 7.days, ingested_at: @frozen_time - 1.minute },
      ])

      timeseries = described_class.new(
        @public_key,
        event: 'event_1',
        start_time: @frozen_time - 2.days,
        end_time: @frozen_time,
        group_by: 'day',
      ).get
      timeseries_data = timeseries.formatted_data
      
      two_days_ago_data_point = timeseries_data.find{ |data_point| data_point[:date] == (@frozen_time - 2.days).beginning_of_day }
      expect(two_days_ago_data_point[:value]).to eq(0)
      
      # uuid 2 and 3
      one_day_ago_data_point = timeseries_data.find{ |data_point| data_point[:date] == (@frozen_time - 1.day).beginning_of_day }
      expect(one_day_ago_data_point[:value]).to eq(2)

      # uuid 1
      today_data_point = timeseries_data.find{ |data_point| data_point[:date] == @frozen_time.beginning_of_day }
      expect(today_data_point[:value]).to eq(1)
    end

    it 'uses the distinct_count_property for the count' do
      @frozen_time = Time.parse('2021-01-01 12:00:00 GMT').to_datetime
      Analytics::Event.insert_all!([
        { uuid: '1', name: 'event_1', properties: { my_unique_prop: '2' }.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 1.hour, ingested_at: @frozen_time },
        { uuid: '2', name: 'event_1', properties: { my_unique_prop: '1' }.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 1.day, ingested_at: @frozen_time },
        { uuid: '3', name: 'event_1', properties: { my_unique_prop: '1' }.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 1.day, ingested_at: @frozen_time },
        # different api key
        { uuid: '4', name: 'event_1', properties: { my_unique_prop: '1' }.to_json, swishjam_api_key: 'different!', occurred_at: @frozen_time - 1.day, ingested_at: @frozen_time },
        # outside of the time range
        { uuid: '5', name: 'event_1', properties: { my_unique_prop: '1' }.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 3.days, ingested_at: @frozen_time },
      ])

      Analytics::Event.insert_all!([
        # does not use this one because its not unique and was ingested before the other
        { uuid: '3', name: 'event_1', properties: { my_unique_prop: 'merged!' }.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 7.days, ingested_at: @frozen_time - 1.minute },
      ])

      timeseries = described_class.new(
        @public_key,
        event: 'event_1',
        distinct_count_property: 'my_unique_prop',
        start_time: @frozen_time - 2.days,
        end_time: @frozen_time,
        group_by: 'day',
      ).get
      timeseries_data = timeseries.formatted_data

      two_days_ago_data_point = timeseries_data.find{ |data_point| data_point[:date] == (@frozen_time - 2.days).beginning_of_day }
      expect(two_days_ago_data_point[:value]).to eq(0)
      
      # uuid 2 and 3 have the same unique prop
      one_day_ago_data_point = timeseries_data.find{ |data_point| data_point[:date] == (@frozen_time - 1.day).beginning_of_day }
      expect(one_day_ago_data_point[:value]).to eq(1)

      # uuid 1
      today_data_point = timeseries_data.find{ |data_point| data_point[:date] == @frozen_time.beginning_of_day }
      expect(today_data_point[:value]).to eq(1)
    end

    it 'returns a timeseries of the specified event for the specified user' do
      @frozen_time = Time.parse('2021-01-01 12:00:00 GMT').to_datetime
      insert_events_into_click_house!(swishjam_api_key: @public_key, name: 'event_1', ingested_at: @frozen_time) do
        [
          { uuid: '1', user_profile_id: '1', occurred_at: @frozen_time - 1.hour },
          { uuid: '2', user_profile_id: '1', occurred_at: @frozen_time - 1.day },
          { uuid: '3', user_profile_id: '1', occurred_at: @frozen_time - 1.day },
          { uuid: '6', user_profile_id: '9', occurred_at: @frozen_time - 1.day },
          { uuid: '7', user_profile_id: '1', name: 'a_different_event', occurred_at: @frozen_time - 1.day },
          # different user profile
          { uuid: '4', user_profile_id: '2', occurred_at: @frozen_time - 1.day },
          # outside of the time range
          { uuid: '5', user_profile_id: '1', occurred_at: @frozen_time - 3.days },
        ]
      end

      insert_events_into_click_house! do
        # does not use this one because its not unique and was ingested before the other
        [{ uuid: '3', user_profile_id: '1', name: 'event_1', swishjam_api_key: @public_key, occurred_at: 7.days.ago, ingested_at: @frozen_time - 1.minute }]
      end

      Analytics::SwishjamUserProfile.insert_all!([
        { swishjam_user_id: '1', workspace_id: 'xyz', merged_into_swishjam_user_id: nil },
        { swishjam_user_id: '2', workspace_id: 'xyz', merged_into_swishjam_user_id: nil },
        { swishjam_user_id: '9', workspace_id: 'xyz', merged_into_swishjam_user_id: '1' },
      ])

      timeseries = described_class.new(
        @public_key,
        event: 'event_1',
        user_profile_id: '1',
        workspace_id: 'xyz',
        start_time: @frozen_time - 2.days,
        end_time: @frozen_time,
        group_by: 'day',
      ).get
      timeseries_data = timeseries.formatted_data
      
      two_days_ago_data_point = timeseries_data.find{ |data_point| data_point[:date] == (@frozen_time - 2.days).beginning_of_day }
      expect(two_days_ago_data_point[:value]).to eq(0)
      
      # uuid 2, 3, and 6
      one_day_ago_data_point = timeseries_data.find{ |data_point| data_point[:date] == (@frozen_time - 1.day).beginning_of_day }
      expect(one_day_ago_data_point[:value]).to eq(3)

      # uuid 1
      today_data_point = timeseries_data.find{ |data_point| data_point[:date] == @frozen_time.beginning_of_day }
      expect(today_data_point[:value]).to eq(1)
    end

    it 'returns a timeseries of any event based on when they occurred if the provided event = "ANY"' do
      Analytics::Event.insert_all!([
        { uuid: '1', name: 'event_1', properties: {}.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 1.hour, ingested_at: @frozen_time },
        { uuid: '2', name: 'event_1', properties: {}.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 1.day, ingested_at: @frozen_time },
        { uuid: '3', name: 'event_1', properties: {}.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 1.day, ingested_at: @frozen_time },
        # different api key
        { uuid: '4', name: 'event_1', properties: {}.to_json, swishjam_api_key: 'different!', occurred_at: @frozen_time - 1.day, ingested_at: @frozen_time },
        # outside of the time range
        { uuid: '5', name: 'event_1', properties: {}.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 3.days, ingested_at: @frozen_time },
        { uuid: '6', name: 'a_different_event', properties: {}.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 1.days, ingested_at: @frozen_time },
      ])

      Analytics::Event.insert_all!([
        # does not use this one because its not unique and was ingested before the other
        { uuid: '3', name: 'event_1', properties: {}.to_json, swishjam_api_key: @public_key, occurred_at: @frozen_time - 7.days, ingested_at: @frozen_time - 1.minute },
      ])

      timeseries = described_class.new(
        @public_key,
        event: described_class.ANY_EVENT,
        start_time: @frozen_time - 2.days,
        end_time: @frozen_time,
        group_by: 'day',
      ).get
      timeseries_data = timeseries.formatted_data
      
      two_days_ago_data_point = timeseries_data.find{ |data_point| data_point[:date] == (@frozen_time - 2.days).beginning_of_day }
      expect(two_days_ago_data_point[:value]).to eq(0)
      
      # uuid 2 and 3
      one_day_ago_data_point = timeseries_data.find{ |data_point| data_point[:date] == (@frozen_time - 1.day).beginning_of_day }
      expect(one_day_ago_data_point[:value]).to eq(3)

      # uuid 1
      today_data_point = timeseries_data.find{ |data_point| data_point[:date] == @frozen_time.beginning_of_day }
      expect(today_data_point[:value]).to eq(1)
    end

    it 'correctly filters data based on user segments' do
      insert_events_into_click_house!(swishjam_api_key: @public_key, name: 'event_1', ingested_at: @frozen_time) do
        [
          { uuid: '1', user_profile_id: '1', occurred_at: @frozen_time - 1.hour },
          { uuid: '2', user_profile_id: '1', occurred_at: @frozen_time - 1.day },
          { uuid: '3', user_profile_id: '1', occurred_at: @frozen_time - 1.day },
          { uuid: '6', user_profile_id: '9', occurred_at: @frozen_time - 1.day },
          { uuid: '7', user_profile_id: '1', name: 'a_different_event', occurred_at: @frozen_time - 1.day },
          # different user profile
          { uuid: '4', user_profile_id: '2', occurred_at: @frozen_time - 1.day },
          # outside of the time range
          { uuid: '5', user_profile_id: '1', occurred_at: @frozen_time - 3.days },
        ]
      end
    end
  end
end