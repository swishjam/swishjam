RANDOM_NUM_OF_DEVICES_PER_USER_MAX = 5
RANDOM_NUM_OF_SESSIONS_PER_DEVICE_MAX = 5
RANDOM_NUM_OF_PAGE_HITS_PER_SESSION_MAX = 10
RANDOM_NUM_OF_EVENTS_PER_PAGE_HIT_MAX = 5

def seed_users!
  puts "Seeding #{NUMBER_OF_USERS} users..."
  NUMBER_OF_USERS.times.map do
    user = Analytics::User.create!(
      swishjam_organization: ORGANIZATION,
      unique_identifier: SecureRandom.uuid,
      email: Faker::Internet.email,
      first_name: Faker::Name.first_name,
      last_name: Faker::Name.last_name,
      metadata_attributes: rand(1..USER_METADATA_OPTIONS.count).times.map do |m|
        { 
          key: USER_METADATA_OPTIONS[m][:key],
          value: USER_METADATA_OPTIONS[m][:faker_klass].send(USER_METADATA_OPTIONS[m][:faker_method])
        }
      end
    )
    seed_devices_for_user!(user)
  end
  seed_organizations!
  assign_users_to_organizations!
  assign_sessions_to_organization!
  # num_new_users_created += NUMBER_OF_USERS
end
alias run_seed! seed_users!

def seed_organizations!
  puts "Seeding #{NUMBER_OF_USERS} organizations."
  NUMBER_OF_USERS.times do
    Analytics::Organization.create!(swishjam_organization: ORGANIZATION, name: Faker::Company.name)
  end
  # num_new_organizations_created += NUMBER_OF_ORGANIZATIONS_PER_USER_MAX
end

def assign_users_to_organizations!
  puts "Assigning users to organizations..."
  Analytics::User.all.each do |user|
    rand(1..4).times do
      Analytics::OrganizationUser.create(user: user, organization: Analytics::Organization.all.sample)
    end
  end
end

def assign_sessions_to_organization!
  puts "Assigning sessions to organizations..."
  Analytics::Session.all.each do |session|
    user = session.device.user
    if user && user.organizations.any?
      session.update!(organization: user.organizations.sample)
    end
  end
end

def seed_devices_for_user!(user, min: 0, max: RANDOM_NUM_OF_DEVICES_PER_USER_MAX)
  num_devices = rand(min..max)
  puts "Seeding #{num_devices} devices for user #{user.id}..."
  num_devices.times do
    device = Analytics::Device.create!(
      swishjam_organization: ORGANIZATION,
      user: user,
      fingerprint: SecureRandom.uuid,
      user_agent: Faker::Internet.user_agent,
      browser: ['Chrome', 'Firefox', 'Safari', 'Internet Explorer', 'Edge', 'Opera'].sample,
      browser_version: rand(100..150),
      os: ['Windows', 'Mac OS X', 'Linux', 'Android', 'iOS'].sample,
      os_version: rand(1..20),
    )
    seed_sessions_for_device!(device)
  end
  # num_new_devices_created += num_devices
end

def seed_sessions_for_device!(device, min: 0, max: RANDOM_NUM_OF_SESSIONS_PER_DEVICE_MAX)
  num_sessions = rand(min..max)
  puts "Seeding #{num_sessions} sessions for device #{device.id}..."
  num_sessions.times do
    session = Analytics::Session.create!(
      device: device,
      unique_identifier: SecureRandom.uuid,
      start_time: Faker::Time.between(from: 1.year.ago, to: Time.now)
    )
    seed_hits_for_session!(session)
  end
  # num_new_sessions_created += num_sessions
end

def seed_hits_for_session!(session, min: 1, max: RANDOM_NUM_OF_PAGE_HITS_PER_SESSION_MAX)
  num_hits = rand(min..max)
  puts "Seeding #{num_hits} page hits for session #{session.id}..."
  num_hits.times do
    url_path = URL_PATHS[rand(0..URL_PATHS.count - 1)]
    page_hit = Analytics::PageHit.create!(
      device: session.device,
      session: session,
      unique_identifier: SecureRandom.uuid,
      full_url: "https://#{HOST_URL}#{url_path}",
      url_host: HOST_URL,
      url_path: url_path,
      # url_query: '',
      # referrer_full_url: '',
      # referrer_url_host: '',
      # referrer_url_path: '',
      # referrer_url_query: '',
      start_time: Faker::Time.between(from: session.start_time, to: session.start_time + 1.hour), # this doesnt prevent sessions from overlapping, but oh well
    )
    seed_events_for_page_hit!(page_hit)
  end
  # num_new_page_hits_created += num_hits
end

def seed_events_for_page_hit!(page_hit, min: 0, max: RANDOM_NUM_OF_EVENTS_PER_PAGE_HIT_MAX)
  num_events = rand(min..max)
  puts "Seeding #{num_events} events for page hit #{page_hit.id}..."
  num_events.times do
    event = Analytics::Event.create!(
      device: page_hit.device,
      session: page_hit.session,
      page_hit: page_hit,
      name: EVENT_NAMES[rand(0..EVENT_NAMES.count - 1)],
      timestamp: Faker::Time.between(from: page_hit.start_time, to: page_hit.start_time + 10.minutes),
      metadata_attributes: rand(0..10).times.map do |m|
        {
          key: Faker::Lorem.word,
          value: Faker::Lorem.word,
        }
      end
    )
  end
  # num_new_events_created += num_events
end

def seed_billing_data!
  puts "Seeding billing data..."
  90.times do |i|
    Analytics::BillingDataSnapshot.create!(
      swishjam_organization: ORGANIZATION,
      mrr_in_cents: rand(0..50_000),
      total_revenue_in_cents: rand(0..1_000_000),
      num_active_subscriptions: rand(0..1_000),
      num_free_trial_subscriptions: rand(0..250),
      num_canceled_subscriptions: rand(0..1_000),
      captured_at: Time.current - i.days,
    )
  end
end

def prompt_user_with_required_value(attribute)
  puts "Enter your #{attribute} for your new user login:"
  value = STDIN.gets.chomp
  if value.blank?
    puts "#{attribute} cannot be blank!"
    prompt_user_with_required_value(attribute)
  end
  value
end

namespace :seed do
  desc "Seeds the database with sample data"
  task dummy_data: [:environment] do
    start = Time.now

    email = prompt_user_with_required_value('email')
    password = prompt_user_with_required_value('password')

    existing_user = Swishjam::User.find_by(email: email)
    if existing_user
      if exsting_user.authenticate(password)
        USER = existing_user
      else
        raise "A user already exists with an email of #{email}, but the provided password was incorrect. Either provide the correct password for #{email}, or you can create a new user by providing a new email."
      end
    else
      USER = Swishjam::User.create!(email: email, password: password)
    end
    ORGANIZATION = Swishjam::Organization.create!(name: Faker::Company.name, url: Faker::Internet.domain_name)
    USER.organizations << ORGANIZATION
    HOST_URL = Faker::Internet.domain_name
    NUMBER_OF_USERS = 100
    URL_PATHS = 50.times.map{ URI.parse(Faker::Internet.url).path }
    EVENT_NAMES = 100.times.map{ Faker::Lorem.word }

    num_new_devices_created = 0
    num_new_users_created = 0
    num_new_sessions_created = 0
    num_new_page_hits_created = 0
    num_new_events_created = 0

    USER_METADATA_OPTIONS = [
      { key: 'Favorite beer', faker_klass: Faker::Beer, faker_method: 'name' },
      { key: 'Personal bank', faker_klass: Faker::Bank, faker_method: 'name' },
      { key: 'College attended', faker_klass: Faker::University, faker_method: 'name' },
      { key: 'Favorite color', faker_klass: Faker::Color, faker_method: 'color_name' },
      { key: 'Favorite superhero', faker_klass: Faker::DcComics, faker_method: 'hero' },
      { key: 'Favorite hobby', faker_klass: Faker::Hobby, faker_method: 'activity' },
    ]
    
    puts "Seeding DB with new dummy organization #{ORGANIZATION.name} (#{ORGANIZATION.id}) with #{NUMBER_OF_USERS} users, and #{HOST_URL} as the host URL."

    run_seed!
    seed_billing_data!

    puts "Seed completed in #{Time.now - start} seconds."
    puts "Created #{num_new_users_created} new users."
    puts "Created #{num_new_devices_created} new devices."
    puts "Created #{num_new_sessions_created} new sessions."
    puts "Created #{num_new_page_hits_created} new page hits."
    puts "Created #{num_new_events_created} new events."
  end
end