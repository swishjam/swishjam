require 'spec_helper'

RSpec.describe ClickHouseQueries::Sessions::Timeseries do

  def create_session_and_page_views(api_key: 'public_key', num_page_views:, num_days_ago:)
    session_identifier = SecureRandom.uuid
    num_page_views.times do |j|
      create(:analytics_event, 
        swishjam_api_key: api_key,
        occurred_at: Time.current - num_days_ago.days - j.minutes, 
        name: Analytics::Event::ReservedNames.PAGE_VIEW, 
        properties: { session_identifier: session_identifier }
      )
    end
  end
  
  describe '#timeseries' do
    it 'returns the correct timeseries data for the timeperiod' do
      10.times{ |i| create_session_and_page_views(num_page_views: rand(1..10), num_days_ago: i) }
      10.times{ |i| create_session_and_page_views(api_key: 'somebody_elses_data', num_page_views: rand(1..10), num_days_ago: i) }
      10.times{ |i| create_session_and_page_views(num_page_views: rand(1..10), num_days_ago: i + 20) }

      querier = ClickHouseQueries::Sessions::Timeseries.new('public_key', start_time: 14.days.ago)
      expect(querier.timeseries.collect{ |h| h[:value] }.sum).to be(10)
    end
  end
end