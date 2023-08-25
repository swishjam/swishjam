require 'spec_helper'

describe ClickHouseQueries::Sessions::FirstPageViewPropertyCount do
  def create_session_and_page_views(api_key: 'public_key', num_page_views:, num_days_ago:, properties: {})
    session_identifier = SecureRandom.uuid
    num_page_views.times do |j|
      create(:analytics_event, 
        swishjam_api_key: api_key,
        occurred_at: Time.current - num_days_ago.days - j.minutes, 
        name: Analytics::Event::ReservedNames.PAGE_VIEW, 
        session_identifier: session_identifier,
        properties: properties
      )
    end
  end

  describe '#get' do
    it 'returns the total count for each distinct property of the first page view' do
      10.times{ |i| create_session_and_page_views(num_page_views: rand(1..10), num_days_ago: i, properties: { some_property: "a_property_value_#{i}"}) }
      10.times{ |i| create_session_and_page_views(api_key: 'somebody_elses_data', num_page_views: rand(1..10), num_days_ago: i, properties: { some_property: "a_property_value_#{i}"}) }
      10.times{ |i| create_session_and_page_views(num_page_views: rand(1..10), num_days_ago: i + 15, properties: { some_property: "a_property_value_#{i}"}) }

      last_two_weeks_querier = ClickHouseQueries::Sessions::FirstPageViewPropertyCount.new('public_key', start_time: 14.days.ago)
      expect(last_two_weeks_querier.get('some_property')['a_property_value_0']).to be(1)
      expect(last_two_weeks_querier.get('some_property')['a_property_value_1']).to be(1)
      expect(last_two_weeks_querier.get('some_property')['a_property_value_2']).to be(1)
      expect(last_two_weeks_querier.get('some_property')['a_property_value_3']).to be(1)
      expect(last_two_weeks_querier.get('some_property')['a_property_value_4']).to be(1)
      expect(last_two_weeks_querier.get('some_property')['a_property_value_5']).to be(1)
      expect(last_two_weeks_querier.get('some_property')['a_property_value_6']).to be(1)
      expect(last_two_weeks_querier.get('some_property')['a_property_value_7']).to be(1)
      expect(last_two_weeks_querier.get('some_property')['a_property_value_8']).to be(1)
      expect(last_two_weeks_querier.get('some_property')['a_property_value_9']).to be(1)

      last_month_querier = ClickHouseQueries::Sessions::FirstPageViewPropertyCount.new('public_key', start_time: 1.month.ago)
      expect(last_month_querier.get('some_property')['a_property_value_0']).to be(2)
      expect(last_month_querier.get('some_property')['a_property_value_1']).to be(2)
      expect(last_month_querier.get('some_property')['a_property_value_2']).to be(2)
      expect(last_month_querier.get('some_property')['a_property_value_3']).to be(2)
      expect(last_month_querier.get('some_property')['a_property_value_4']).to be(2)
      expect(last_month_querier.get('some_property')['a_property_value_5']).to be(2)
      expect(last_month_querier.get('some_property')['a_property_value_6']).to be(2)
      expect(last_month_querier.get('some_property')['a_property_value_7']).to be(2)
      expect(last_month_querier.get('some_property')['a_property_value_8']).to be(2)
      expect(last_month_querier.get('some_property')['a_property_value_9']).to be(2)
    end
  end
end