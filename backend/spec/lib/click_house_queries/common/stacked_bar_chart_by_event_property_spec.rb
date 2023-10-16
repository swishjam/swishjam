require 'spec_helper'

describe ClickHouseQueries::Common::StackedBarChartByEventProperty do
  describe '#data' do
    it 'correctly formats stacked bar chart data for the requested event and property, grouping all properties outside of the 10 most common for that timeframe in the "other"' do
      workspace = FactoryBot.create(:workspace)
      public_key = workspace.api_keys.first.public_key

      frozen_time = Time.current

      10.times do |i|
        FactoryBot.create(:analytics_event, 
          swishjam_api_key: public_key, 
          occurred_at: frozen_time, 
          name: 'my_event_to_chart', 
          properties: { some_property_to_chart: "property_value_#{i + 1}" }
        )
        FactoryBot.create(:analytics_event, 
          swishjam_api_key: public_key, 
          occurred_at: frozen_time, 
          name: 'my_event_to_chart', 
          properties: { some_property_to_chart: "property_value_#{i + 1}" }
        )
        FactoryBot.create(:analytics_event, 
          swishjam_api_key: public_key, 
          occurred_at: frozen_time, 
          name: 'my_event_to_chart', 
          properties: { some_property_to_chart: "property_value_#{i + 1}" }
        )
      end

      FactoryBot.create(:analytics_event, 
        swishjam_api_key: public_key, 
        occurred_at: frozen_time, 
        name: 'my_event_to_chart', 
        properties: { some_property_to_chart: "should_fall_into_other_category" }
      )
      FactoryBot.create(:analytics_event, 
        swishjam_api_key: public_key, 
        occurred_at: frozen_time, 
        name: 'my_event_to_chart', 
        properties: { some_property_to_chart: "also_should_fall_into_other_category" }
      )
      FactoryBot.create(:analytics_event, 
        swishjam_api_key: public_key, 
        occurred_at: frozen_time, 
        name: 'my_event_to_chart', 
        properties: { some_property_to_chart: "last_one_that_should_fall_into_other_category" }
      )
      FactoryBot.create(:analytics_event, 
        swishjam_api_key: public_key, 
        occurred_at: frozen_time - 1.week, 
        name: 'my_event_to_chart', 
        properties: { some_property_to_chart: "last_one_that_should_fall_into_other_category" }
      )

      bar_chart_data = ClickHouseQueries::Common::StackedBarChartByEventProperty.new(
        [public_key],
        event_name: 'my_event_to_chart',
        property: 'some_property_to_chart',
      ).data.filled_in_data

      bar_chart_data_for_frozen_time = bar_chart_data.find{ |h| h[:date] === frozen_time.beginning_of_day }

      10.times do |i|
        expect(bar_chart_data_for_frozen_time["property_value_#{i + 1}"]).to be(3)
      end
      expect(bar_chart_data_for_frozen_time["other"]).to be(3)
      expect(bar_chart_data_for_frozen_time['should_fall_into_other_category']).to be(nil)
      expect(bar_chart_data_for_frozen_time['also_should_fall_into_other_category']).to be(nil)
      expect(bar_chart_data_for_frozen_time['last_one_that_should_fall_into_other_category']).to be(nil)

      bar_chart_data_for_one_week_ago = bar_chart_data.find{ |h| h[:date] === (frozen_time - 1.week).beginning_of_day }
      expect(bar_chart_data_for_one_week_ago.keys.count).to be(2) # one for date, and one for the "other" grouping
      expect(bar_chart_data_for_one_week_ago['other']).to be(1)

      bar_chart_data_for_top_11 = ClickHouseQueries::Common::StackedBarChartByEventProperty.new(
        [public_key],
        event_name: 'my_event_to_chart',
        property: 'some_property_to_chart',
        max_ranking_to_not_be_considered_other: 11,
      ).data.filled_in_data

      bar_chart_data_for_top_11_for_frozen_time = bar_chart_data_for_top_11.find{ |h| h[:date] === frozen_time.beginning_of_day }

      10.times do |i|
        expect(bar_chart_data_for_top_11_for_frozen_time["property_value_#{i + 1}"]).to be(3)
      end
      expect(bar_chart_data_for_top_11_for_frozen_time['last_one_that_should_fall_into_other_category']).to be(1)
      expect(bar_chart_data_for_top_11_for_frozen_time["other"]).to be(2)
      expect(bar_chart_data_for_top_11_for_frozen_time['should_fall_into_other_category']).to be(nil)
      expect(bar_chart_data_for_top_11_for_frozen_time['also_should_fall_into_other_category']).to be(nil)

      bar_chart_data_for_top_11_for_one_week_ago = bar_chart_data_for_top_11.find{ |h| h[:date] === (frozen_time - 1.week).beginning_of_day }
      expect(bar_chart_data_for_top_11_for_one_week_ago.keys.count).to be(2) # one for date, and one for "last_one_that_should_fall_into_other_category"
      expect(bar_chart_data_for_top_11_for_one_week_ago['last_one_that_should_fall_into_other_category']).to be(1)
    end
  end
end