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
      created_at: 6.weeks.ago,
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
        swishjam_api_key: WORKSPACE.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key,
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
      swishjam_api_key: WORKSPACE.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key,
      device_identifier: DEVICE_IDENTIFIERS.sample,
      swishjam_user_id: other_user.id,
      occurred_at: identify_events_for_user.first.occurred_at - 10.minutes,
    )
    total_identify_events += 1
  end
  puts "Created #{total_identify_events} user identify events!"
  puts "\n"
end

def seed_sessions_page_hits_and_events!
  progress_bar = TTY::ProgressBar.new("Generating #{NUMBER_OF_SESSIONS_TO_GENERATE} sessions with random number of page views and events [:bar]", total: NUMBER_OF_SESSIONS_TO_GENERATE, bar_format: :block)

  max_days_ago = {
    100 => 30,
    500 => 60,
    1_000 => 90,
    5_000 => 180,
    10_000 => 365,
    20_000 => 365,
  }[NUMBER_OF_SESSIONS_TO_GENERATE]

  sessions = NUMBER_OF_SESSIONS_TO_GENERATE.times.map do
    # user_profile = AnalyticsUserProfile.all.sample
    # user_is_anonymous = rand() < 0.75
    # swishjam_user_id = user_is_anonymous ? nil : user_profile.id
    device_identifier = DEVICE_IDENTIFIERS.sample
    session_start_time = Time.current - rand(0..max_days_ago).days
    public_key = [
      WORKSPACE.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key,
      WORKSPACE.api_keys.for_data_source!(ApiKey::ReservedDataSources.MARKETING).public_key,
    ].sample

    session_event = create_session_with_events!(public_key: public_key, device_identifier: device_identifier, session_start_time: session_start_time)

    progress_bar.advance
    session_event
  end
  puts "\n"
  sessions
end

def create_session_with_events!(public_key:, device_identifier:, session_start_time:)
  session_identifier = SecureRandom.uuid
  session_referrer = "https://#{REFERRER_HOSTS[rand(0..REFERRER_HOSTS.count - 1)]}#{URL_PATHS[rand(0..URL_PATHS.count - 1)]}"
  session_start_url = "https://#{HOST_URL}#{URL_PATHS[rand(0..URL_PATHS.count - 1)]}"

  session_event = Analytics::Event.create!(
    uuid: SecureRandom.uuid,
    swishjam_api_key: public_key,
    name: Analytics::Event::ReservedNames.NEW_SESSION,
    occurred_at: session_start_time,
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
    }
  )

  rand(1..10).times do |i|
    page_view_event = create_page_view_event!(
      public_key: public_key,
      session_identifier: session_identifier, 
      device_identifier: device_identifier, 
      occurred_at: session_start_time + (i * 2).minutes + 1.second,
    )
  end
  rand(1..10).times do |i|
    create_rand_event!(
      public_key: public_key,
      session_identifier: session_identifier, 
      device_identifier: device_identifier, 
      occurred_at: session_start_time + (i * 2).minutes + 30.seconds,
    )
  end
  session_event
end

def create_page_view_event!(public_key:, session_identifier:, device_identifier:, occurred_at:)
  url_path = URL_PATHS[rand(0..URL_PATHS.count - 1)]
  referrer_url = "https://#{REFERRER_HOSTS[rand(0..REFERRER_HOSTS.count - 1)]}#{URL_PATHS[rand(0..URL_PATHS.count - 1)]}"
  Analytics::Event.create!(
    swishjam_api_key: public_key,
    uuid: SecureRandom.uuid,
    name: Analytics::Event::ReservedNames.PAGE_VIEW,
    occurred_at: occurred_at,
    properties: {
      device_identifier: device_identifier,
      session_identifier: session_identifier,
      page_view_identifier: SecureRandom.uuid,
      url: "https://#{HOST_URL}#{url_path}",
      referrer: referrer_url,
    }
  )
end

def create_rand_event!(public_key:, session_identifier:, device_identifier:, occurred_at:)
  url_path = URL_PATHS[rand(0..URL_PATHS.count - 1)]
  random_props = {} 
  rand(0..7).times{ |m| random_props[Faker::Lorem.word] = Faker::Lorem.word }
  Analytics::Event.create!(
    swishjam_api_key: public_key,
    uuid: SecureRandom.uuid,
    name: EVENT_NAMES[rand(0..EVENT_NAMES.count - 1)],
    occurred_at: occurred_at,
    properties: random_props.merge({
      device_identifier: device_identifier,
      session_identifier: session_identifier,
      url: "https://#{HOST_URL}#{url_path}",
    })
  )
end

def create_organization_identify_events_for_sessions!(sessions)
  progress_bar = TTY::ProgressBar.new("Creating random number of organization identify events for #{sessions.count} sessions [:bar]", total: sessions.count, bar_format: :block)
  total_identify_events = 0

  sessions.each do |session|
    most_recent_user_identify_event_for_session = Analytics::UserIdentifyEvent.where(device_identifier: session.properties[Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER]).order(occurred_at: :desc).first
    # 10% of sessions that have a user_identify_event will have an organization_identify_event
    # rand() < 0.9
    if most_recent_user_identify_event_for_session
      user = AnalyticsUserProfile.find(most_recent_user_identify_event_for_session.swishjam_user_id)
      Analytics::OrganizationIdentifyEvent.create!(
        swishjam_api_key: most_recent_user_identify_event_for_session.swishjam_api_key,
        swishjam_organization_id: user.analytics_organization_profiles.sample.id,
        device_identifier: session.properties[Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER],
        session_identifier: session.properties[Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER],
        occurred_at: Faker::Time.between(from: 1.year.ago, to: Time.now),
      )
      total_identify_events += 1
    end
    progress_bar.advance
  end
  puts "Created #{total_identify_events} organization identify events! (#{total_identify_events.to_f/sessions.count}% of sessions belongs to an organization)"
  puts "\n"
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
      swishjam_api_key: WORKSPACE.api_keys.for_data_source!(ApiKey::ReservedDataSources.INTEGRATIONS).public_key,
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

def generate_specific_user_data_if_necessary!
  should_generate = PROMPTER.select('Generate data for specific user?', ['yes', 'no']){ |q| q.default 'yes' }
  if should_generate == 'yes'
    email = PROMPTER.ask("Enter the email for the user:"){ |q| q.required true }
    first_name = PROMPTER.ask('Enter first name for the user:'){ |q| q.required true }
    last_name = PROMPTER.ask('Enter last name for the user:'){ |q| q.required true }
    user_profile = AnalyticsUserProfile.create!(workspace: WORKSPACE, email: email, first_name: first_name, last_name: last_name, user_unique_identifier: email)

    domain_name = email.split('@')[-1]
    organization_name = domain_name.split('.')[0].capitalize
    user_profile.analytics_organization_profiles << AnalyticsOrganizationProfile.create!(workspace: WORKSPACE, name: organization_name, organization_unique_identifier: organization_name)

    device_identifier = SecureRandom.uuid
    identify = Analytics::UserIdentifyEvent.create!(
      swishjam_api_key: WORKSPACE.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key,
      device_identifier: device_identifier,
      swishjam_user_id: user_profile.id,
      occurred_at: Faker::Time.between(from: 1.year.ago, to: Time.now),
    )

    public_key = WORKSPACE.api_keys.for_data_source!(rand() > 0.75 ? ApiKey::ReservedDataSources.MARKETING : ApiKey::ReservedDataSources.PRODUCT).public_key

    puts "Generating 10 random sessions with events for #{user_profile.email}"
    10.times do
      create_session_with_events!(public_key: public_key, device_identifier: device_identifier, session_start_time: session_start_time = Time.current - rand(0..30).days)
    end
  else
    puts "Not generating specific user data."
  end
end

namespace :seed do
  desc "Seeds the database with sample data"
  task dummy_data: [:environment] do
    ActiveRecord::Base.logger.silence do
      START_TIME = Time.current

      USER = prompt_and_find_or_create_user!
      NUMBER_OF_SESSIONS_TO_GENERATE = PROMPTER.select("How many sessions would you like to backfill?", [100, 500, 1_000, 5_000, 10_000, 20_000]){ |q| q.default 3 }
      
      WORKSPACE = USER.workspaces.first || Workspace.create!(name: Faker::Company.name, company_url: Faker::Internet.domain_name, public_key: 'DEPRECATED')
      HOST_URL = Faker::Internet.domain_name
      NUMBER_OF_USERS = (NUMBER_OF_SESSIONS_TO_GENERATE * 0.75).to_i
      DEVICE_IDENTIFIERS = (NUMBER_OF_USERS * 1.05).to_i.times.map{ SecureRandom.uuid }
      URL_PATHS = 10.times.map{ URI.parse(Faker::Internet.url).path }
      REFERRER_HOSTS = 10.times.map{ URI.parse(Faker::Internet.url).host }
      # EVENT_NAMES = 50.times.map{ Faker::Lorem.word }
      EVENT_NAMES = [
        'PDF Downloaded', 'Chat Initiated', 'Chat Closed', 'Invited Teammate', 'Support Ticket Submitted', 'Search Submitted', 'Feedback Provided',
        'AI Hallucination Recieved', 'Updated Setting', 'API Error Received', 'Upgraded Subscription Plan', 'Added Seat', 'Payment Submitted'
      ]
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
      create_user_identify_events!(users)
      new_session_events = seed_sessions_page_hits_and_events!
      create_organization_identify_events_for_sessions!(new_session_events)
      seed_billing_data!

      generate_specific_user_data_if_necessary!

      puts "Seed completed in #{Time.now - START_TIME} seconds."
    end
  end
end
