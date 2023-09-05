require "tty-prompt"
require 'tty-progressbar'

PROMPTER = TTY::Prompt.new

def seed_user_profiles!
  progress_bar = TTY::ProgressBar.new("Seeding #{NUMBER_OF_USERS} user profiles [:bar]", total: NUMBER_OF_USERS, bar_format: :block, )
  users = NUMBER_OF_USERS.to_i.times.map do
    user = AnalyticsUserProfile.create!(
      workspace: WORKSPACE,
      user_unique_identifier: SecureRandom.uuid,
      email: Faker::Internet.email,
      first_name: Faker::Name.first_name,
      last_name: Faker::Name.last_name,
      metadata: rand(1..USER_ATTRIBUTE_OPTIONS.count).times.map do |m|
        obj = {}
        obj[USER_ATTRIBUTE_OPTIONS[m][:key]] = USER_ATTRIBUTE_OPTIONS[m][:faker_klass].send(USER_ATTRIBUTE_OPTIONS[m][:faker_method])
      end
    )
    progress_bar.advance
    user
  end
  puts "\n"
  users
end

def seed_organization_profiles!
  progress_bar = TTY::ProgressBar.new("Seeding #{NUMBER_OF_USERS} organization profiles [:bar]", total: NUMBER_OF_USERS, bar_format: :block, )
  organizations = NUMBER_OF_USERS.to_i.times.map do
    org = AnalyticsOrganizationProfile.create!(
      workspace: WORKSPACE, 
      name: Faker::Company.name, 
      organization_unique_identifier: SecureRandom.uuid,
      metadata: rand(1..USER_ATTRIBUTE_OPTIONS.count).times.map do |m|
        obj = {}
        obj[USER_ATTRIBUTE_OPTIONS[m][:key]] = USER_ATTRIBUTE_OPTIONS[m][:faker_klass].send(USER_ATTRIBUTE_OPTIONS[m][:faker_method])
      end
    )
    progress_bar.advance
    org
  end
  puts "\n"
  organizations
end

def assign_user_profiles_to_organization_profiles!(users, organizations)
  progress_bar = TTY::ProgressBar.new("Assigning #{NUMBER_OF_USERS} user profiles to a random number of organization profiles (1-4) [:bar]", total: users.count, bar_format: :block)
  users.each do |user_profile|
    rand(1..4).times do
      if !AnalyticsOrganizationProfileUser.create(analytics_user_profile_id: user_profile.id, analytics_organization_profile_id:  organizations.sample.id)
        puts "Failed to assign user profile #{user_profile.id} to organization profile #{organizations.sample.id}".colorize(:red)
      end
    end
    progress_bar.advance
  end
  puts "\n"
end

def create_user_identify_events!(user_profiles)
  # profiles = WORKSPACE.analytics_user_profiles
  progress_bar = TTY::ProgressBar.new("Creating random number of user identify events for #{user_profiles.count} users [:bar]", total: user_profiles.count, bar_format: :block)
  total_identify_events = 0

  user_profiles.each do |user_profile|
    num_of_devices_for_user = rand(1..2)
    identify_events_for_user = num_of_devices_for_user.times.map do |i|
      identify = Analytics::UserIdentifyEvent.create!(
        swishjam_api_key: WORKSPACE.public_key,
        device_identifier: DEVICE_IDENTIFIERS.sample,
        swishjam_user_id: user_profile.id,
        occurred_at: Faker::Time.between(from: 1.year.ago, to: Time.now),
      )
      total_identify_events += 1
      identify
    end
    progress_bar.advance
    # create a login from a different user in the past for 10% of users
    # this ensures our logic for attributing events to users is correct
    next unless rand() < 0.1 
    # other_user = user_profiles.where.not(id: user_profile.id).sample
    other_user = user_profiles.sample
    Analytics::UserIdentifyEvent.create!(
      swishjam_api_key: WORKSPACE.public_key,
      device_identifier: DEVICE_IDENTIFIERS.sample,
      swishjam_user_id: other_user.id,
      occurred_at: identify_events_for_user.first.occurred_at - 10.minutes,
    )
    total_identify_events += 1
  end
  puts "Created #{total_identify_events} user identify events!"
  puts "\n"
end

def seed_events!
  progress_bar = TTY::ProgressBar.new("Generating #{NUMBER_OF_SESSIONS_TO_GENERATE} sessions with random number of page views and events [:bar]", total: NUMBER_OF_SESSIONS_TO_GENERATE, bar_format: :block)

  max_days_ago = {
    100 => 30,
    500 => 60,
    1_000 => 90,
    5_000 => 180,
    10_000 => 365,
    20_000 => 365,
  }[NUMBER_OF_SESSIONS_TO_GENERATE]

  NUMBER_OF_SESSIONS_TO_GENERATE.times do
    session_identifier = SecureRandom.uuid
    user_profile = AnalyticsUserProfile.all.sample
    user_is_anonymous = rand() < 0.75
    swishjam_user_id = user_is_anonymous ? nil : user_profile.id
    swishjam_organization_id = user_is_anonymous ? nil : user_profile.reload.analytics_organization_profiles&.sample&.id
    device_identifier = DEVICE_IDENTIFIERS.sample
    session_start_time = Time.current - rand(0..max_days_ago).days

    session_referrer = "https://#{REFERRER_HOSTS[rand(0..REFERRER_HOSTS.count - 1)]}#{URL_PATHS[rand(0..URL_PATHS.count - 1)]}"
    session_start_url = "https://#{HOST_URL}#{URL_PATHS[rand(0..URL_PATHS.count - 1)]}"
    Analytics::Event.create!(
      uuid: SecureRandom.uuid,
      swishjam_api_key: WORKSPACE.public_key,
      name: Analytics::Event::ReservedNames.NEW_SESSION,
      occurred_at: session_start_time,
      device_identifier: device_identifier,
      session_identifier: session_identifier,
      swishjam_organization_id: swishjam_organization_id,
      url: session_start_url,
      url_host: HOST_URL,
      url_path: URI.parse(session_start_url).path,
      referrer_url: session_referrer,
      referrer_url_host: URI.parse(session_referrer).host,
      referrer_url_path: URI.parse(session_referrer).path,
      referrer_url_query: URI.parse(session_referrer).query,
      utm_source: Faker::Lorem.word,
      utm_medium: Faker::Lorem.word,
      utm_campaign: Faker::Lorem.word,
      utm_term: Faker::Lorem.word,
      is_mobile: [true, false].sample,
      device_type: ['mobile', 'desktop'].sample,
      browser: ['Chrome', 'Firefox', 'Safari', 'Internet Explorer'].sample,
      browser_version: rand(1..10).to_s,
      os: ['Mac OS X', 'Windows', 'Linux'].sample,
      os_version: rand(1..10).to_s,
      user_agent: Faker::Internet.user_agent,
    )

    rand(1..10).times do |i|
      page_view_event = create_page_view_event!(
        session_identifier: session_identifier, 
        device_identifier: device_identifier, 
        swishjam_organization_id: swishjam_organization_id,
        occurred_at: session_start_time + (i * 2).minutes + 1.second,
      )
    end
    rand(1..10).times do |i|
      create_rand_event!(
        session_identifier: session_identifier, 
        device_identifier: device_identifier, 
        swishjam_organization_id: swishjam_organization_id,
        occurred_at: session_start_time + (i * 2).minutes + 30.seconds,
      )
    end
    progress_bar.advance
  end
  puts "\n"
end

def create_page_view_event!(session_identifier:, device_identifier:, swishjam_organization_id:, occurred_at:)
  url_path = URL_PATHS[rand(0..URL_PATHS.count - 1)]
  referrer_url = "https://#{REFERRER_HOSTS[rand(0..REFERRER_HOSTS.count - 1)]}#{URL_PATHS[rand(0..URL_PATHS.count - 1)]}"
  Analytics::Event.create!(
    swishjam_api_key: WORKSPACE.public_key,
    uuid: SecureRandom.uuid,
    name: Analytics::Event::ReservedNames.PAGE_VIEW,
    occurred_at: occurred_at,
    device_identifier: device_identifier,
    session_identifier: session_identifier,
    swishjam_organization_id: swishjam_organization_id,
    url: "https://#{HOST_URL}#{url_path}",
    url_host: HOST_URL,
    url_path: url_path,
    referrer_url: referrer_url,
    referrer_url_host: URI.parse(referrer_url).host,
    referrer_url_path: URI.parse(referrer_url).path,
    referrer_url_query: URI.parse(referrer_url).query,
    utm_source: Faker::Lorem.word,
    utm_medium: Faker::Lorem.word,
    utm_campaign: Faker::Lorem.word,
    utm_term: Faker::Lorem.word,
    is_mobile: [true, false].sample,
    device_type: ['mobile', 'desktop'].sample,
    browser: ['Chrome', 'Firefox', 'Safari', 'Internet Explorer'].sample,
    browser_version: rand(1..10).to_s,
    os: ['Mac OS X', 'Windows', 'Linux'].sample,
    os_version: rand(1..10).to_s,
    user_agent: Faker::Internet.user_agent,
  )
end

def create_rand_event!(session_identifier:, device_identifier:, swishjam_organization_id:, occurred_at:)
  url_path = URL_PATHS[rand(0..URL_PATHS.count - 1)]
  random_props = {} 
  rand(0..7).times{ |m| random_props[Faker::Lorem.word] = Faker::Lorem.word }
  Analytics::Event.create!(
    swishjam_api_key: WORKSPACE.public_key,
    uuid: SecureRandom.uuid,
    name: EVENT_NAMES[rand(0..EVENT_NAMES.count - 1)],
    occurred_at: occurred_at,
    device_identifier: device_identifier,
    session_identifier: session_identifier,
    swishjam_organization_id: swishjam_organization_id,
    url: "https://#{HOST_URL}#{url_path}",
    url_host: HOST_URL,
    url_path: url_path,
    properties: random_props,
  )
end

def seed_billing_data!
  progress_bar = TTY::ProgressBar.new("Generating billing data for the last 365 days [:bar]", total: 90, bar_format: :block)
  
  previous_mrr = 1_000_000 * 100
  previous_total_revenue = 5_000_000 * 100
  previous_num_active_subscriptions = 1_000
  previous_num_free_trial_subscriptions = 250
  previous_num_canceled_subscriptions = 1_000

  last_snapshot = nil
  365.times do |i|
    last_snapshot = Analytics::BillingDataSnapshot.create!(
      swishjam_api_key: WORKSPACE.public_key,
      mrr_in_cents: (last_snapshot&.mrr_in_cents || 1_000_000 * 100) * 0.95,
      total_revenue_in_cents: (last_snapshot&.total_revenue_in_cents || 5_000_000 * 100) * 0.95,
      num_active_subscriptions: (last_snapshot&.num_active_subscriptions || 1_000) * 0.95,
      num_free_trial_subscriptions: (last_snapshot&.num_free_trial_subscriptions || 250) * 0.95,
      num_canceled_subscriptions: (last_snapshot&.num_canceled_subscriptions || 1_000) * 0.95,
      captured_at: Time.current - i.days,
    )
    progress_bar.advance
  end
  puts "\n"
end

def prompt_and_find_or_create_user!
  email = PROMPTER.ask("Enter your email for your new user login:"){ |q| q.required true }
  password = PROMPTER.mask("Enter your password for your new user login:"){ |q| q.required true }

  existing_user = User.find_by(email: email)
  if existing_user
    if existing_user.authenticate(password)
      puts "Going to use existing user with email #{email}."
      return existing_user
    else
      raise "A user already exists with an email of #{email}, but the provided password was incorrect. Either provide the correct password for #{email}, or you can create a new user by providing a new email."
    end
  else
    puts "Creating new user with email #{email}."
    return User.create!(email: email, password: password)
  end
  puts "\n"
end

namespace :seed do
  desc "Seeds the database with sample data"
  task dummy_data: [:environment] do
    ActiveRecord::Base.logger.silence do
      START_TIME = Time.current

      USER = prompt_and_find_or_create_user!
      NUMBER_OF_SESSIONS_TO_GENERATE = PROMPTER.select("How many sessions would you like to backfill?", [100, 500, 1_000, 5_000, 10_000, 20_000]){ |q| q.default 3 }
      
      WORKSPACE = USER.workspaces.first || Workspace.create!(name: Faker::Company.name, company_url: Faker::Internet.domain_name)
      HOST_URL = Faker::Internet.domain_name
      NUMBER_OF_USERS = (NUMBER_OF_SESSIONS_TO_GENERATE * 0.75).to_i
      DEVICE_IDENTIFIERS = (NUMBER_OF_USERS * 1.05).to_i.times.map{ SecureRandom.uuid }
      URL_PATHS = 50.times.map{ URI.parse(Faker::Internet.url).path }
      REFERRER_HOSTS = 50.times.map{ URI.parse(Faker::Internet.url).host }
      EVENT_NAMES = 100.times.map{ Faker::Lorem.word }
      USER_ATTRIBUTE_OPTIONS = [
        { key: 'Favorite beer', faker_klass: Faker::Beer, faker_method: 'name' },
        { key: 'Personal bank', faker_klass: Faker::Bank, faker_method: 'name' },
        { key: 'College attended', faker_klass: Faker::University, faker_method: 'name' },
        { key: 'Favorite color', faker_klass: Faker::Color, faker_method: 'color_name' },
        { key: 'Favorite superhero', faker_klass: Faker::DcComics, faker_method: 'hero' },
        { key: 'Favorite hobby', faker_klass: Faker::Hobby, faker_method: 'activity' },
      ]

      USER.workspaces << WORKSPACE unless USER.workspaces.include?(WORKSPACE)

      puts "Seeding workspace #{WORKSPACE.name} (#{WORKSPACE.id}) with #{NUMBER_OF_USERS} users, and #{HOST_URL} as the host URL.\n\n"

      users = seed_user_profiles!
      organizations = seed_organization_profiles!
      assign_user_profiles_to_organization_profiles!(users, organizations)
      # create_user_identify_events!(users)
      seed_events!
      seed_billing_data!

      puts "Seed completed in #{Time.now - START_TIME} seconds."
    end
  end
end
