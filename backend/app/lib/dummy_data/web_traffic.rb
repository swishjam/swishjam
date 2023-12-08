module DummyData
  class WebTraffic
    REFERRER_OPTIONS = %w[https://google.com https://twitter.com https://facebook.com https://hackernews.com https://ycombinator.com https://tiktok.com https://producthunt.com https://youtube.com https://reddit.com]

    def initialize(public_key:, number_of_sessions:, device_identifiers:, url_host:, url_paths:, event_names:, data_begins_max_number_of_days_ago:, percent_of_sessions_to_include_utms: 0.5)
      @public_key = public_key
      @number_of_sessions = number_of_sessions
      @device_identifiers = device_identifiers
      @url_host = url_host
      @url_paths = url_paths
      @event_names = event_names
      @data_begins_max_number_of_days_ago = data_begins_max_number_of_days_ago
      @percent_of_sessions_to_include_utms = percent_of_sessions_to_include_utms
    end


    def create_sessions_page_views_and_events!
      progress_bar = TTY::ProgressBar.new("Generating #{@number_of_sessions} sessions with random number of page views and events [:bar]", total: @number_of_sessions, bar_format: :block)

      sessions = @number_of_sessions.times.map do
        session_event = create_session_with_page_views_and_events!(
          start_time: Time.current - rand(-10..@data_begins_max_number_of_days_ago.to_f).days,
          device_identifier: @device_identifiers.sample, 
        )

        progress_bar.advance
        session_event
      end
      puts "\n"
      sessions
    end

    def create_session_with_page_views_and_events!(start_time:, device_identifier:)
      session_identifier = SecureRandom.uuid
      session_referrer = REFERRER_OPTIONS.sample
      
      session_start_url = "https://#{@url_host}#{@url_paths[rand(0..@url_paths.count - 1)]}"
      if rand(0..1) < @percent_of_sessions_to_include_utms
        session_start_url += "?utm_source=#{Faker::Lorem.word}&utm_medium=#{Faker::Lorem.word}&utm_campaign=#{Faker::Lorem.word}&utm_term=#{Faker::Lorem.word}&utm_content=#{Faker::Lorem.word}"
      end

      session_event = Analytics::Event.create!(
        uuid: SecureRandom.uuid,
        swishjam_api_key: @public_key,
        name: Analytics::Event::ReservedNames.NEW_SESSION,
        occurred_at: start_time,
        properties: {
          device_identifier: device_identifier,
          session_identifier: session_identifier,
          url: session_start_url,
          referrer: session_referrer,
          is_mobile: [true, false].sample,
          device_type: ['mobile', 'desktop'].sample,
          browser_name: ['Chrome', 'Firefox', 'Safari', 'Internet Explorer'].sample,
          browser_version: rand(1..10).to_s,
          os: ['Mac OS X', 'Windows', 'Linux'].sample,
          os_version: rand(1..10).to_s,
          user_agent: Faker::Internet.user_agent,
        }.to_json
      )

      rand(1..10).times do |i|
        page_view_event = create_page_view_event!(
          session_identifier: session_identifier, 
          device_identifier: device_identifier, 
          occurred_at: start_time + (i * 2).minutes + 1.second,
        )
      end
      rand(1..10).times do |i|
        create_rand_event!(
          session_identifier: session_identifier, 
          device_identifier: device_identifier, 
          occurred_at: start_time + (i * 2).minutes + 30.seconds,
        )
      end
      session_event
    end

    def create_page_view_event!(session_identifier:, device_identifier:, occurred_at:)
      # referrer_url = "https://#{REFERRER_HOSTS[rand(0..REFERRER_HOSTS.count - 1)]}#{URL_PATHS[rand(0..URL_PATHS.count - 1)]}"
      Analytics::Event.create!(
        swishjam_api_key: @public_key,
        uuid: SecureRandom.uuid,
        name: Analytics::Event::ReservedNames.PAGE_VIEW,
        occurred_at: occurred_at,
        properties: {
          device_identifier: device_identifier,
          session_identifier: session_identifier,
          page_view_identifier: SecureRandom.uuid,
          url: "https://#{@url_host}#{@url_paths.sample}",
          # referrer: referrer_url,
        }.to_json
      )
    end

    def create_rand_event!(session_identifier:, device_identifier:, occurred_at:)
      random_props = Hash.new.tap do |h|
        rand(0..7).times{ h[Faker::Lorem.word] = Faker::Lorem.word }
      end
      Analytics::Event.create!(
        swishjam_api_key: @public_key,
        uuid: SecureRandom.uuid,
        name: @event_names.sample,
        occurred_at: occurred_at,
        properties: random_props.merge({
          device_identifier: device_identifier,
          session_identifier: session_identifier,
          url: "https://#{@host_url}#{@url_paths.sample}",
        }).to_json
      )
    end
  end
end