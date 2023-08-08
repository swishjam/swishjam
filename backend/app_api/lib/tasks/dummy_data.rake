def seed_users!
  puts "Seeding #{NUMBER_OF_USERS} users..."
  NUMBER_OF_USERS.times.map do
    user = INSTANCE.users.create!(
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
  NUM_NEW_USERS += NUMBER_OF_USERS
end
alias run_seed! seed_users!

def seed_devices_for_user!(user, min: 0, max: 10)
  num_devices = rand(min..max)
  puts "Seeding #{num_devices} devices for user #{user.id}..."
  num_devices.times do
    device = Device.create!(
      fingerprint: SecureRandom.uuid,
      instance: INSTANCE,
      user: user,
      user_agent: Faker::Internet.user_agent,
      browser: ['Chrome', 'Firefox', 'Safari', 'Internet Explorer', 'Edge', 'Opera'].sample,
      browser_version: rand(100..150),
      os: ['Windows', 'Mac OS X', 'Linux', 'Android', 'iOS'].sample,
      os_version: rand(1..20),
    )
    seed_sessions_for_device!(device)
  end
  NUM_NEW_DEVICES += num_devices
end

def seed_sessions_for_device!(device, min: 0, max: 20)
  num_sessions = rand(min..max)
  puts "Seeding #{num_sessions} sessions for device #{device.id}..."
  num_sessions.times do
    session = Session.create!(
      device: device,
      unique_identifier: SecureRandom.uuid,
      start_time: Faker::Time.between(from: 1.year.ago, to: Time.now)
    )
    seed_hits_for_session!(session)
  end
  NUM_NEW_SESSIONS += num_sessions
end

def seed_hits_for_session!(session, min: 0, max: 20)
  num_hits = rand(min..max)
  puts "Seeding #{num_hits} page hits for session #{session.id}..."
  num_hits.times do
    url_path = URL_PATHS[rand(0..URL_PATHS.count - 1)]
    page_hit = PageHit.create!(
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
  NUM_NEW_PAGE_HITS += num_hits
end

def seed_events_for_page_hit!(page_hit, min: 0, max: 10)
  num_events = rand(min..max)
  puts "Seeding #{num_events} events for page hit #{page_hit.id}..."
  num_events.times do
    event = Event.create!(
      device: page_hit.device,
      session: page_hit.session,
      page_hit: page_hit,
      name: EVENT_NAMES[rand(0..EVENT_NAMES.count - 1)],
      metadata_attributes: rand(0..10).times.map do |m|
        {
          key: Faker::Lorem.word,
          value: Faker::Lorem.word,
        }
      end
    )
  end
  NUM_NEW_EVENTS += num_events
end

namespace :seed do
  desc "Seeds the database with sample data"
  task dummy_data: [:environment] do
    start = Time.now

    PUBLIC_KEY = "INSTANCE-#{SecureRandom.hex(4)}"
    INSTANCE = Instance.find_or_create_by!(public_key: PUBLIC_KEY)
    HOST_URL = Faker::Internet.domain_name
    NUMBER_OF_USERS = 100
    URL_PATHS = 50.times.map{ URI.parse(Faker::Internet.url).path }
    EVENT_NAMES = 100.times{ Faker::Lorem.word }

    NUM_NEW_DEVICES = 0
    NUM_NEW_USERS = 0
    NUM_NEW_SESSIONS = 0
    NUM_NEW_PAGE_HITS = 0
    NUM_NEW_EVENTS = 0

    USER_METADATA_OPTIONS = [
      { key: 'Favorite beer', faker_klass: Faker::Beer, faker_method: 'name' },
      { key: 'Personal bank', faker_klass: Faker::Bank, faker_method: 'name' },
      { key: 'College attended', faker_klass: Faker::University, faker_method: 'name' },
      { key: 'Favorite color', faker_klass: Faker::Color, faker_method: 'color_name' },
      { key: 'Favorite superhero', faker_klass: Faker::DcComics, faker_method: 'hero' },
      { key: 'Favorite hobby', faker_klass: Faker::Hobby, faker_method: 'activity' },
    ]
    
    puts "Seeding DB with new dummy instance (#{PUBLIC_KEY}) with #{NUMBER_OF_USERS} users, and #{HOST_URL} as the host URL."

    run_seed! 

    puts "Seed completed in #{Time.now - start} seconds."
    puts "Created #{NUM_NEW_USERS} new users."
    puts "Created #{NUM_NEW_DEVICES} new devices."
    puts "Created #{NUM_NEW_SESSIONS} new sessions."
    puts "Created #{NUM_NEW_PAGE_HITS} new page hits."
    puts "Created #{NUM_NEW_EVENTS} new events."
  end
end
