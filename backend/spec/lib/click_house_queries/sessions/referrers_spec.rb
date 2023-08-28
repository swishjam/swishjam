require 'spec_helper'

describe ClickHouseQueries::Sessions::Referrers do
  def create_session_and_page_views(api_key: 'public_key', num_page_views:, num_days_ago:, referrer:)
    session_identifier = SecureRandom.uuid
    previous_url = nil
    num_page_views.times do |j|
      url = "https://www.example.com#{URI.parse(Faker::Internet.url).path}"
      create(:analytics_event, 
        swishjam_api_key: api_key,
        occurred_at: Time.current - num_days_ago.days + j.minutes, 
        name: Analytics::Event::ReservedNames.PAGE_VIEW, 
        properties: {
          session_identifier: session_identifier,
          full_url: url,
          url_host: URI.parse(url).host,
          url_path: URI.parse(url).path,
          referrer_full_url: j == 0 ? referrer : previous_url,
          referrer_url_host: URI.parse(j == 0 ? referrer : previous_url).host,
          referrer_url_path: URI.parse(j == 0 ? referrer : previous_url).path,
        }
      )
      previous_url = url
    end
  end

  describe '#get' do
    it 'returns the total count for each distinct url_host of the first page view' do
      10.times do |i| 
        create_session_and_page_views(
          num_page_views: rand(1..10), 
          num_days_ago: i, 
          referrer: i.even? ? "https://twitter.com/path-#{i}" : "https://facebook.com/path-#{i}"
        )
      end
      10.times do |i| 
        create_session_and_page_views(
          api_key: 'somebody_elses_data', 
          num_page_views: rand(1..10), 
          num_days_ago: i, 
          referrer: i.even? ? "https://twitter.com/path-#{i}" : "https://facebook.com/path-#{i}"
        )
      end
      10.times do |i| 
        create_session_and_page_views(
          num_page_views: rand(1..10), 
          num_days_ago: i + 15, 
          referrer: i.even? ? "https://twitter.com/path-#{i}" : "https://facebook.com/path-#{i}"
        )
      end

      last_two_weeks_querier = ClickHouseQueries::Sessions::Referrers.new('public_key', start_time: 14.days.ago)
      expect(last_two_weeks_querier.by_host.include?({ :referrer => "twitter.com", :count => 5 })).to be(true)
      expect(last_two_weeks_querier.by_host.include?({ :referrer => "facebook.com", :count => 5 })).to be(true)
      expect(last_two_weeks_querier.by_full_url.include?({ :referrer => "twitter.com/path-0", :count => 1 })).to be(true)
      expect(last_two_weeks_querier.by_full_url.include?({ :referrer => "twitter.com/path-2", :count => 1 })).to be(true)
      expect(last_two_weeks_querier.by_full_url.include?({ :referrer => "twitter.com/path-4", :count => 1 })).to be(true)
      expect(last_two_weeks_querier.by_full_url.include?({ :referrer => "twitter.com/path-6", :count => 1 })).to be(true)
      expect(last_two_weeks_querier.by_full_url.include?({ :referrer => "twitter.com/path-8", :count => 1 })).to be(true)
      expect(last_two_weeks_querier.by_full_url.include?({ :referrer => "facebook.com/path-1", :count => 1 })).to be(true)
      expect(last_two_weeks_querier.by_full_url.include?({ :referrer => "facebook.com/path-3", :count => 1 })).to be(true)
      expect(last_two_weeks_querier.by_full_url.include?({ :referrer => "facebook.com/path-5", :count => 1 })).to be(true)
      expect(last_two_weeks_querier.by_full_url.include?({ :referrer => "facebook.com/path-7", :count => 1 })).to be(true)
      expect(last_two_weeks_querier.by_full_url.include?({ :referrer => "facebook.com/path-9", :count => 1 })).to be(true)


      last_month_querier = ClickHouseQueries::Sessions::Referrers.new('public_key', start_time: 1.month.ago)
      expect(last_month_querier.by_host.include?({ :referrer => "twitter.com", :count => 10 })).to be(true)
      expect(last_month_querier.by_host.include?({ :referrer => "facebook.com", :count => 10 })).to be(true)
      expect(last_month_querier.by_full_url.include?({ :referrer => "twitter.com/path-0", :count => 2 })).to be(true)
      expect(last_month_querier.by_full_url.include?({ :referrer => "twitter.com/path-2", :count => 2 })).to be(true)
      expect(last_month_querier.by_full_url.include?({ :referrer => "twitter.com/path-4", :count => 2 })).to be(true)
      expect(last_month_querier.by_full_url.include?({ :referrer => "twitter.com/path-6", :count => 2 })).to be(true)
      expect(last_month_querier.by_full_url.include?({ :referrer => "twitter.com/path-8", :count => 2 })).to be(true)
      expect(last_month_querier.by_full_url.include?({ :referrer => "facebook.com/path-1", :count => 2 })).to be(true)
      expect(last_month_querier.by_full_url.include?({ :referrer => "facebook.com/path-3", :count => 2 })).to be(true)
      expect(last_month_querier.by_full_url.include?({ :referrer => "facebook.com/path-5", :count => 2 })).to be(true)
      expect(last_month_querier.by_full_url.include?({ :referrer => "facebook.com/path-7", :count => 2 })).to be(true)
      expect(last_month_querier.by_full_url.include?({ :referrer => "facebook.com/path-9", :count => 2 })).to be(true)
    end

    it 'returns an empty string when there is no referrer for the first page hit' do
      10.times do |i| 
        create_session_and_page_views(
          num_page_views: rand(1..10), 
          num_days_ago: i, 
          referrer: i.even? ? "" : "https://facebook.com/path-#{i}"
        )
        create_session_and_page_views(
          api_key: 'somebody_elses_data',
          num_page_views: rand(1..10), 
          num_days_ago: i, 
          referrer: i.even? ? "" : "https://facebook.com/path-#{i}"
        )
      end

      10.times do |i|
        create_session_and_page_views(
          api_key: 'somebody_elses_data',
          num_page_views: rand(1..10),
          num_days_ago: i + 15,
          referrer: i.even? ? "" : "https://facebook.com/path-#{i}"
        )
        create_session_and_page_views(
          num_page_views: rand(1..10),
          num_days_ago: i + 15,
          referrer: i.even? ? "" : "https://facebook.com/path-#{i}"
        )
      end

      last_two_weeks_querier = ClickHouseQueries::Sessions::Referrers.new('public_key', start_time: 14.days.ago)
      expect(last_two_weeks_querier.by_host.include?({ :referrer => "", :count => 5 })).to be(true)
      expect(last_two_weeks_querier.by_host.include?({ :referrer => "facebook.com", :count => 5 })).to be(true)
      expect(last_two_weeks_querier.by_full_url.include?({ :referrer => "", :count => 5 })).to be(true)
      expect(last_two_weeks_querier.by_full_url.include?({ :referrer => "facebook.com/path-1", :count => 1 })).to be(true)
      expect(last_two_weeks_querier.by_full_url.include?({ :referrer => "facebook.com/path-3", :count => 1 })).to be(true)
      expect(last_two_weeks_querier.by_full_url.include?({ :referrer => "facebook.com/path-5", :count => 1 })).to be(true)
      expect(last_two_weeks_querier.by_full_url.include?({ :referrer => "facebook.com/path-7", :count => 1 })).to be(true)
      expect(last_two_weeks_querier.by_full_url.include?({ :referrer => "facebook.com/path-9", :count => 1 })).to be(true)

      last_month_querier = ClickHouseQueries::Sessions::Referrers.new('public_key', start_time: 1.month.ago)
      expect(last_month_querier.by_host.include?({ :referrer => "", :count => 10 })).to be(true)
      expect(last_month_querier.by_host.include?({ :referrer => "facebook.com", :count => 10 })).to be(true)
      expect(last_month_querier.by_full_url.include?({ :referrer => "", :count => 10 })).to be(true)
      expect(last_month_querier.by_full_url.include?({ :referrer => "facebook.com/path-1", :count => 2 })).to be(true)
      expect(last_month_querier.by_full_url.include?({ :referrer => "facebook.com/path-3", :count => 2 })).to be(true)
      expect(last_month_querier.by_full_url.include?({ :referrer => "facebook.com/path-5", :count => 2 })).to be(true)
      expect(last_month_querier.by_full_url.include?({ :referrer => "facebook.com/path-7", :count => 2 })).to be(true)
      expect(last_month_querier.by_full_url.include?({ :referrer => "facebook.com/path-9", :count => 2 })).to be(true)
    end
  end
end