module DummyData
  class Integrations
    class << self
      def seed_events!(workspace:, number_of_stripe_events:, number_of_resend_events:, data_begins_max_number_of_days_ago:)
        progress_bar = TTY::ProgressBar.new("Generating integration events (Stripe, Resend) [:bar]", total: number_of_stripe_events + number_of_resend_events, bar_format: :block)
        stripe_integration_public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.STRIPE).public_key

        number_of_stripe_events.to_i.times do
          Analytics::Event.create!(name: 'charge.succeeded', occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, properties: { amount: rand(10 * 100..1_000 * 100) }, uuid: SecureRandom.uuid, swishjam_api_key: stripe_integration_public_key)
          Analytics::Event.create!(name: 'customer.created', occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, properties: {}, uuid: SecureRandom.uuid, swishjam_api_key: stripe_integration_public_key)
          Analytics::Event.create!(name: 'customer.subscription.created', occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, properties: {}, uuid: SecureRandom.uuid, swishjam_api_key: stripe_integration_public_key)
          if rand() < 0.1
            Analytics::Event.create!(name: 'customer.subscription.paused', occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, properties: {}, uuid: SecureRandom.uuid, swishjam_api_key: stripe_integration_public_key)
          end
          if rand() < 0.15
            Analytics::Event.create!(name: 'customer.subscription.deleted', occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, properties: {}, uuid: SecureRandom.uuid, swishjam_api_key: stripe_integration_public_key)
          end
          if rand() < 0.1
            Analytics::Event.create!(name: 'charge.refunded', occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, properties: { amount: rand(10 * 100..1_000 * 100) }, uuid: SecureRandom.uuid, swishjam_api_key: stripe_integration_public_key)
          end
          if rand() < 0.05
            Analytics::Event.create!(name: 'charge.dispute.created', occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, properties: { amount: rand(10 * 100..1_000 * 100) }, uuid: SecureRandom.uuid, swishjam_api_key: stripe_integration_public_key)
          end
          progress_bar.advance
        end

        resend_integration_public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.RESEND).public_key
        number_of_resend_events.to_i.times do
          Analytics::Event.create!(name: 'email.sent', occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, properties: { to: Faker::Internet.email, subject: Faker::Lorem.sentence }, uuid: SecureRandom.uuid, swishjam_api_key: resend_integration_public_key)
          if rand() <= 0.95
            Analytics::Event.create!(name: 'email.delivered', occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, properties: { to: Faker::Internet.email, subject: Faker::Lorem.sentence }, uuid: SecureRandom.uuid, swishjam_api_key: resend_integration_public_key)
          end
          if rand() <= 0.05
            Analytics::Event.create!(name: 'email.complained', occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, properties: { to: Faker::Internet.email, subject: Faker::Lorem.sentence }, uuid: SecureRandom.uuid, swishjam_api_key: resend_integration_public_key)
          end
          if rand() <= 0.05
            Analytics::Event.create!(name: 'email.bounced', occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, properties: { to: Faker::Internet.email, subject: Faker::Lorem.sentence }, uuid: SecureRandom.uuid, swishjam_api_key: resend_integration_public_key)
          end
          if rand() <= 0.75
            Analytics::Event.create!(name: 'email.opened', occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, properties: { to: Faker::Internet.email, subject: Faker::Lorem.sentence }, uuid: SecureRandom.uuid, swishjam_api_key: resend_integration_public_key)
          end
          if rand() <= 0.45
            Analytics::Event.create!(name: 'email.clicked', occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, properties: { to: Faker::Internet.email, subject: Faker::Lorem.sentence }, uuid: SecureRandom.uuid, swishjam_api_key: resend_integration_public_key)
          end
          progress_bar.advance
        end
      end
    end
  end
end