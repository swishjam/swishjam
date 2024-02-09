module DummyData
  class Integrations
    class << self
      def seed_events!(workspace:, number_of_stripe_events:, number_of_resend_events:, number_of_intercom_events:, data_begins_max_number_of_days_ago:, user_profile_id: nil)
        progress_bar = TTY::ProgressBar.new("Generating integration events (Stripe, Resend, and Intercom) [:bar]", total: number_of_stripe_events + number_of_resend_events, bar_format: :block)
        stripe_integration_public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.STRIPE).public_key

        number_of_stripe_events.to_i.times do
          Analytics::Event.create!(name: 'stripe.charge.succeeded', occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, properties: { user_profile_id: user_profile_id, amount: rand(10 * 100..1_000 * 100) }.to_json, uuid: SecureRandom.uuid, swishjam_api_key: stripe_integration_public_key)
          Analytics::Event.create!(name: 'stripe.customer.created', occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, properties: { user_profile_id: user_profile_id }.to_json, uuid: SecureRandom.uuid, swishjam_api_key: stripe_integration_public_key)
          Analytics::Event.create!(name: 'stripe.customer.subscription.created', occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, properties: { user_profile_id: user_profile_id }.to_json, uuid: SecureRandom.uuid, swishjam_api_key: stripe_integration_public_key)
          if rand() < 0.1
            occurred_at = Time.current - rand(-10..data_begins_max_number_of_days_ago).days
            mrr = rand(10_00..1_000_00)
            cancellation_feedback = %w[unused too_expensive too_complex switched_service other missing_features low_quality customer_service].sample
            cancellation_comment = Faker::Lorem.sentence
            cancellation_reason = %w[cancellation_requested payment_disputed payment_failed].sample
            Analytics::Event.create!(
              uuid: SecureRandom.uuid, 
              name: 'stripe.supplemental.subscription.churned', 
              occurred_at: occurred_at, 
              swishjam_api_key: stripe_integration_public_key,
              properties: { 
                mrr: mrr,
                cancellation_comment: cancellation_comment,
                cancellation_feedback: cancellation_feedback,
                cancellation_reason: cancellation_reason, 
                user_profile_id: user_profile_id,
              }.to_json, 
            )
            if rand() < 0.9
              Analytics::Event.create!(
                uuid: SecureRandom.uuid, 
                name: 'stripe.supplemental.customer.churned', 
                occurred_at: occurred_at,
                swishjam_api_key: stripe_integration_public_key,
                properties: { 
                  mrr: mrr,
                  cancellation_comment: cancellation_comment,
                  cancellation_feedback: cancellation_feedback,
                  cancellation_reason: cancellation_reason, 
                  user_profile_id: user_profile_id,
                }.to_json, 
              )
            end
          end
          if rand() < 0.1
            Analytics::Event.create!(name: 'stripe.customer.subscription.paused', occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, properties: { user_profile_id: user_profile_id }.to_json, uuid: SecureRandom.uuid, swishjam_api_key: stripe_integration_public_key)
          end
          if rand() < 0.15
            Analytics::Event.create!(name: 'stripe.customer.subscription.deleted', occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, properties: { user_profile_id: user_profile_id }.to_json, uuid: SecureRandom.uuid, swishjam_api_key: stripe_integration_public_key)
          end
          if rand() < 0.1
            Analytics::Event.create!(name: 'stripe.charge.refunded', occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, properties: { user_profile_id: user_profile_id, amount: rand(10 * 100..1_000 * 100) }.to_json, uuid: SecureRandom.uuid, swishjam_api_key: stripe_integration_public_key)
          end
          if rand() < 0.05
            Analytics::Event.create!(name: 'stripe.charge.dispute.created', occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, properties: { user_profile_id: user_profile_id, amount: rand(10 * 100..1_000 * 100) }.to_json, uuid: SecureRandom.uuid, swishjam_api_key: stripe_integration_public_key)
          end
          progress_bar.advance
        end

        resend_integration_public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.RESEND).public_key
        number_of_resend_events.to_i.times do
          Analytics::Event.create!(name: 'resend.email.sent', occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, properties: { user_profile_id: user_profile_id, to: [user_profile_id || Faker::Internet.email].join(', '), subject: Faker::Lorem.sentence }.to_json, uuid: SecureRandom.uuid, swishjam_api_key: resend_integration_public_key)
          if rand() <= 0.95
            Analytics::Event.create!(name: 'resend.email.delivered', occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, properties: { user_profile_id: user_profile_id, to: [user_profile_id || Faker::Internet.email].join(', '), subject: Faker::Lorem.sentence }.to_json, uuid: SecureRandom.uuid, swishjam_api_key: resend_integration_public_key)
          end
          if rand() <= 0.05
            Analytics::Event.create!(name: 'resend.email.complained', occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, properties: { user_profile_id: user_profile_id, to: [user_profile_id || Faker::Internet.email].join(', '), subject: Faker::Lorem.sentence }.to_json, uuid: SecureRandom.uuid, swishjam_api_key: resend_integration_public_key)
          end
          if rand() <= 0.05
            Analytics::Event.create!(name: 'resend.email.bounced', occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, properties: { user_profile_id: user_profile_id, to: [user_profile_id || Faker::Internet.email].join(', '), subject: Faker::Lorem.sentence }.to_json, uuid: SecureRandom.uuid, swishjam_api_key: resend_integration_public_key)
          end
          if rand() <= 0.75
            Analytics::Event.create!(name: 'resend.email.opened', occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, properties: { user_profile_id: user_profile_id, to: [user_profile_id || Faker::Internet.email].join(', '), subject: Faker::Lorem.sentence }.to_json, uuid: SecureRandom.uuid, swishjam_api_key: resend_integration_public_key)
          end
          if rand() <= 0.45
            Analytics::Event.create!(name: 'resend.email.clicked', occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, properties: { user_profile_id: user_profile_id, to: [user_profile_id || Faker::Internet.email].join(', '), subject: Faker::Lorem.sentence }.to_json, uuid: SecureRandom.uuid, swishjam_api_key: resend_integration_public_key)
          end

          topics = %w[company.created	company.updated	contact.email.updated	contact.lead.added_email contact.lead.created	contact.lead.signed_up contact.subscribed	
            contact.user.created contact.user.tag.created	contact.user.tag.deleted contact.user.updated	conversation.admin.closed	conversation.admin.noted
            conversation.admin.replied conversation.admin.single.created conversation.contact.attached conversation.user.created conversation.user.replied	
            granular.subscribe ticket.contact.attached ticket.contact.replied ticket.created ticket.state.updated visitor.signed_up]
          number_of_intercom_events.to_i.times do
            topics.each do |topic|
              if rand() <= 0.05
                Analytics::Event.create!(
                  name: "intercom.#{topic}", 
                  uuid: SecureRandom.uuid, 
                  swishjam_api_key: resend_integration_public_key,
                  occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, 
                  properties: { user_profile_id: user_profile_id }.to_json, 
                )
              end
            end
          end

          progress_bar.advance
        end
      end
    end
  end
end