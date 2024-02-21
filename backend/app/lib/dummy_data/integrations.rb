module DummyData
  class Integrations
    class << self
      def seed_events!(workspace:, number_of_stripe_events:, number_of_resend_events:, number_of_intercom_events:, data_begins_max_number_of_days_ago:, user_profile_id: nil)
        progress_bar = TTY::ProgressBar.new("Generating integration events (Stripe, Resend, and Intercom) [:bar]", total: number_of_stripe_events + number_of_resend_events + number_of_intercom_events, bar_format: :block)
        stripe_integration_public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.STRIPE).public_key
        user_profile = user_profile_id ? AnalyticsUserProfile.find(user_profile_id) : nil

        events = []
        number_of_stripe_events.to_i do
          events << Ingestion::ParsedEventFromIngestion.new(
            name: 'stripe.charge.succeeded', 
            occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, 
            user_profile_id: user_profile_id, 
            user_properties: user_profile&.metadata,
            properties: { amount: rand(10 * 100..1_000 * 100) }, 
            uuid: SecureRandom.uuid, 
            swishjam_api_key: stripe_integration_public_key,
          ).formatted_for_ingestion
          events << Ingestion::ParsedEventFromIngestion.new(
            name: 'stripe.customer.created', 
            occurred_at: Time.current - rand(0..data_begins_max_number_of_days_ago).days, 
            user_profile_id: user_profile_id, 
            user_properties: user_profile&.metadata, 
            properties: {},
            uuid: SecureRandom.uuid, 
            swishjam_api_key: stripe_integration_public_key,
          ).formatted_for_ingestion
          events << Ingestion::ParsedEventFromIngestion.new(
            name: 'stripe.customer.subscription.created', 
            occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, 
            user_profile_id: user_profile_id, 
            user_properties: user_profile&.metadata, 
            properties: {},
            uuid: SecureRandom.uuid, 
            swishjam_api_key: stripe_integration_public_key,
          ).formatted_for_ingestion
          if rand() < 0.1
            occurred_at = Time.current - rand(-10..data_begins_max_number_of_days_ago).days
            mrr = rand(10_00..1_000_00)
            cancellation_feedback = %w[unused too_expensive too_complex switched_service other missing_features low_quality customer_service].sample
            cancellation_comment = Faker::Lorem.sentence
            cancellation_reason = %w[cancellation_requested payment_disputed payment_failed].sample
            events << Ingestion::ParsedEventFromIngestion.new(
              uuid: SecureRandom.uuid, 
              name: 'stripe.supplemental.subscription.churned', 
              occurred_at: occurred_at, 
              swishjam_api_key: stripe_integration_public_key,
              user_profile_id: user_profile_id,
              user_properties: user_profile&.metadata,
              properties: { 
                mrr: mrr,
                cancellation_comment: cancellation_comment,
                cancellation_feedback: cancellation_feedback,
                cancellation_reason: cancellation_reason, 
                user_profile_id: user_profile_id,
              }
            ).formatted_for_ingestion
          end
          if rand() < 0.1
            events << Ingestion::ParsedEventFromIngestion.new(
              name: 'stripe.customer.subscription.paused', 
              occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, 
              user_profile_id: user_profile_id,
              user_properties: user_profile&.metadata,
              properties: {},
              uuid: SecureRandom.uuid, 
              swishjam_api_key: stripe_integration_public_key,
            ).formatted_for_ingestion
          end
          if rand() < 0.15
            events << Ingestion::ParsedEventFromIngestion.new(
              name: 'stripe.customer.subscription.deleted', 
              occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, 
              user_profile_id: user_profile_id,
              user_properties: user_profile&.metadata,
              properties: {},
              uuid: SecureRandom.uuid, 
              swishjam_api_key: stripe_integration_public_key
            ).formatted_for_ingestion
          end
          if rand() < 0.1
            events << Ingestion::ParsedEventFromIngestion.new(
              name: 'stripe.charge.refunded', 
              occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, 
              user_profile_id: user_profile_id,
              user_properties: user_profile&.metadata,
              properties: { amount: rand(10 * 100..1_000 * 100) }, 
              uuid: SecureRandom.uuid, 
              swishjam_api_key: stripe_integration_public_key
            ).formatted_for_ingestion
          end
          if rand() < 0.05
            events << Ingestion::ParsedEventFromIngestion.new(
              name: 'stripe.charge.dispute.created', 
              occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, 
              user_profile_id: user_profile_id,
              user_properties: user_profile&.metadata,
              properties: { amount: rand(10 * 100..1_000 * 100) }, 
              uuid: SecureRandom.uuid, 
              swishjam_api_key: stripe_integration_public_key
            ).formatted_for_ingestion
          end
          progress_bar.advance
        end

        resend_integration_public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.RESEND).public_key
        number_of_resend_events.to_i.times do
          events << Ingestion::ParsedEventFromIngestion.new(
            name: 'resend.email.sent', 
            occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, 
            user_profile_id: user_profile_id,
            user_properties: user_profile&.metadata&.to_json,
            properties: { to: [user_profile&.email || Faker::Internet.email].join(', '), subject: Faker::Lorem.sentence }, 
            uuid: SecureRandom.uuid, 
            swishjam_api_key: resend_integration_public_key
          ).formatted_for_ingestion
          if rand() <= 0.95
            events << Ingestion::ParsedEventFromIngestion.new(
              name: 'resend.email.delivered', 
              occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, 
              user_profile_id: user_profile_id,
              user_properties: user_profile&.metadata,
              properties: { to: [user_profile&.email || Faker::Internet.email].join(', '), subject: Faker::Lorem.sentence }, 
              uuid: SecureRandom.uuid, 
              swishjam_api_key: resend_integration_public_key
            ).formatted_for_ingestion
          end
          if rand() <= 0.05
            events << Ingestion::ParsedEventFromIngestion.new(
              name: 'resend.email.complained', 
              occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, 
              user_profile_id: user_profile_id,
              user_properties: user_profile&.metadata,
              properties: { to: [user_profile&.email || Faker::Internet.email].join(', '), subject: Faker::Lorem.sentence }, 
              uuid: SecureRandom.uuid, 
              swishjam_api_key: resend_integration_public_key
            ).formatted_for_ingestion
          end
          if rand() <= 0.05
            events << Ingestion::ParsedEventFromIngestion.new(
              name: 'resend.email.bounced', 
              occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, 
              user_profile_id: user_profile_id,
              user_properties: user_profile&.metadata,
              properties: { to: [user_profile&.email || Faker::Internet.email].join(', '), subject: Faker::Lorem.sentence }, 
              uuid: SecureRandom.uuid, 
              swishjam_api_key: resend_integration_public_key
            ).formatted_for_ingestion
          end
          if rand() <= 0.75
            events << Ingestion::ParsedEventFromIngestion.new(
              name: 'resend.email.opened', 
              occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, 
              user_profile_id: user_profile_id,
              user_properties: user_profile&.metadata,
              properties: { to: [user_profile&.email || Faker::Internet.email].join(', '), subject: Faker::Lorem.sentence }, 
              uuid: SecureRandom.uuid, 
              swishjam_api_key: resend_integration_public_key
            ).formatted_for_ingestion
          end
          if rand() <= 0.45
            events << Ingestion::ParsedEventFromIngestion.new(
              name: 'resend.email.clicked', 
              occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, 
              user_profile_id: user_profile_id,
              user_properties: user_profile&.metadata,
              properties: { to: [user_profile&.email || Faker::Internet.email].join(', '), subject: Faker::Lorem.sentence }, 
              uuid: SecureRandom.uuid, 
              swishjam_api_key: resend_integration_public_key
            ).formatted_for_ingestion
          end
          progress_bar.advance
        end
        intercom_integration_public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.INTERCOM).public_key
        topics = %w[company.created	company.updated	contact.email.updated	contact.lead.added_email contact.lead.created	contact.lead.signed_up contact.subscribed	
          contact.user.created contact.user.tag.created	contact.user.tag.deleted contact.user.updated	conversation.admin.closed	conversation.admin.noted
          conversation.admin.replied conversation.admin.single.created conversation.contact.attached conversation.user.created conversation.user.replied	
          granular.subscribe ticket.contact.attached ticket.contact.replied ticket.created ticket.state.updated visitor.signed_up]
        number_of_intercom_events.to_i.times do
          topics.each do |topic|
            if rand() <= 0.05
              events << Ingestion::ParsedEventFromIngestion.new(
                name: "intercom.#{topic}", 
                uuid: SecureRandom.uuid, 
                swishjam_api_key: intercom_integration_public_key,
                user_profile_id: user_profile_id,
                user_properties: user_profile&.metadata,
                properties: {},
                occurred_at: Time.current - rand(-10..data_begins_max_number_of_days_ago).days, 
              ).formatted_for_ingestion
            end
          end
          progress_bar.advance
        end

        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.PREPARED_EVENTS, events)
      end
    end
  end
end