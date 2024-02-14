module DummyData
  class WebTraffic
    REFERRER_OPTIONS = %w[https://google.com https://twitter.com https://facebook.com https://hackernews.com https://ycombinator.com https://tiktok.com https://producthunt.com https://youtube.com https://reddit.com]

    def initialize(
      public_key:, 
      number_of_sessions:, 
      user_profile_ids:, 
      organization_profile_ids:,
      url_host:, 
      url_paths:, 
      event_names:, 
      data_begins_max_number_of_days_ago:, 
      percent_of_sessions_to_include_utms: 0.5
    )
      @public_key = public_key
      @number_of_sessions = number_of_sessions
      @user_profile_ids = user_profile_ids
      @organization_profile_ids = organization_profile_ids
      @url_host = url_host
      @url_paths = url_paths
      @event_names = event_names
      @data_begins_max_number_of_days_ago = data_begins_max_number_of_days_ago
      @percent_of_sessions_to_include_utms = percent_of_sessions_to_include_utms
    end


    def create_sessions_page_views_and_events!
      progress_bar = TTY::ProgressBar.new("Generating #{@number_of_sessions} sessions with random number of page views and events [:bar]", total: @number_of_sessions, bar_format: :block)

      all_events = @number_of_sessions.times.map do
        event_jsons = session_with_page_views_and_events!(
          start_time: Time.current - rand(-10..@data_begins_max_number_of_days_ago.to_f).days,
          user_profile_id: @user_profile_ids.sample, 
          organization_profile_id: rand(0..1.0) > 0.5 ? @organization_profile_ids.sample : nil,
        )

        progress_bar.advance
        event_jsons
      end
      Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.PREPARED_EVENTS, all_events.flatten)
      puts "\n"
      all_events
    end

    def session_with_page_views_and_events!(start_time:, user_profile_id:, organization_profile_id:)
      session_identifier = SecureRandom.uuid
      session_referrer = REFERRER_OPTIONS.sample
      
      session_start_url = "https://#{@url_host}#{@url_paths[rand(0..@url_paths.count - 1)]}"
      if rand(0..1) < @percent_of_sessions_to_include_utms
        session_start_url += "?utm_source=#{Faker::Lorem.word}&utm_medium=#{Faker::Lorem.word}&utm_campaign=#{Faker::Lorem.word}&utm_term=#{Faker::Lorem.word}&utm_content=#{Faker::Lorem.word}"
      end

      session_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: SecureRandom.uuid,
        swishjam_api_key: @public_key,
        name: Analytics::Event::ReservedNames.NEW_SESSION,
        user_profile_id: user_profile_id,
        user_properties: AnalyticsUserProfile.find(user_profile_id).metadata,
        organization_profile_id: organization_profile_id,
        organization_properties: AnalyticsOrganizationProfile.find_by(id: organization_profile_id)&.metadata,
        occurred_at: start_time,
        properties: {
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
        }
      ).formatted_for_ingestion

      page_views = rand(1..10).times.map do |i|
        page_view_event!(
          session_identifier: session_identifier, 
          user_profile_id: user_profile_id, 
          organization_profile_id: organization_profile_id,
          occurred_at: start_time + (i * 2).minutes + 1.second,
        )
      end
      rand_events = rand(1..10).times.map do |i|
        rand_event!(
          session_identifier: session_identifier, 
          user_profile_id: user_profile_id,
          organization_profile_id: organization_profile_id,
          occurred_at: start_time + (i * 2).minutes + 30.seconds,
        )
      end
      [session_event, page_views, rand_events].flatten
    end

    def page_view_event!(session_identifier:, user_profile_id:, organization_profile_id:, occurred_at:)
      referrer_url = "https://#{@url_host}#{@url_paths.sample}"

      Ingestion::ParsedEventFromIngestion.new(
        uuid: SecureRandom.uuid,
        swishjam_api_key: @public_key,
        name: Analytics::Event::ReservedNames.PAGE_VIEW,
        user_profile_id: user_profile_id,
        user_properties: AnalyticsUserProfile.find(user_profile_id).metadata.to_json,
        organization_profile_id: organization_profile_id,
        organization_properties: AnalyticsOrganizationProfile.find_by(id: organization_profile_id)&.metadata&.to_json,
        occurred_at: occurred_at,
        properties: {
          session_identifier: session_identifier,
          page_view_identifier: SecureRandom.uuid,
          url: "https://#{@url_host}#{@url_paths.sample}",
          referrer: referrer_url,
        }
      ).formatted_for_ingestion
    end

    def rand_event!(session_identifier:, user_profile_id:, organization_profile_id:, occurred_at:)
      random_props = Hash.new.tap do |h|
        rand(0..7).times{ h[Faker::Lorem.word] = Faker::Lorem.word }
      end
      # Analytics::Event.create!(
      Ingestion::ParsedEventFromIngestion.new(
        uuid: SecureRandom.uuid,
        swishjam_api_key: @public_key,
        name: @event_names.sample,
        user_profile_id: user_profile_id,
        user_properties: AnalyticsUserProfile.find(user_profile_id).metadata,
        organization_profile_id: organization_profile_id,
        organization_properties: AnalyticsOrganizationProfile.find_by(id: organization_profile_id)&.metadata,
        occurred_at: occurred_at,
        properties: random_props.merge({
          session_identifier: session_identifier,
          url: "https://#{@host_url}#{@url_paths.sample}",
        })
      ).formatted_for_ingestion
    end
  end
end