module Ingestion
  module EventPreparers
    class StripeEventHandler < Base
      EVENT_ATTRIBUTE_PARSERS_BY_EVENT_TYPE_DICT = {
        'charge.failed' => StripeHelpers::EventAttributeParsers::ChargeFailed,
        'charge.succeeded' => StripeHelpers::EventAttributeParsers::ChargeSucceeded,
        'subscription.created' => StripeHelpers::EventAttributeParsers::SubscriptionCreated,
      }

      def handle_and_return_parsed_events!
        parsed_event.set_user_profile(user_profile_for_event) if user_profile_for_event.present?
        parsed_event.override_properties!(event_properties_for_event_type)
        [parsed_event].concat(supplemental_events_to_be_processed)
      end

      private

      def event_properties_for_event_type
        klass = EVENT_ATTRIBUTE_PARSERS_BY_EVENT_TYPE_DICT[stripe_event.type] || StripeHelpers::EventAttributeParsers::Base
        klass.new(stripe_event).event_properties
      end

      def user_profile_for_event
        @user_profile_for_event ||= begin
          return if stripe_customer.nil? || !stripe_customer.respond_to?(:email) || stripe_customer.email.blank?
          user_profile = workspace.analytics_user_profiles.find_by(email: stripe_customer.email)
          if user_profile.nil?
            user_profile = workspace.analytics_user_profiles.new(email: stripe_customer.email, created_by_data_source: ApiKey::ReservedDataSources.STRIPE)
          end
          user_profile.metadata['stripe_customer_id'] ||= stripe_customer.id
          user_profile.metadata['stripe_customer_name'] ||= stripe_customer.name
          if stripe_customer.respond_to?(:address)
            user_profile.metadata['stripe_address_city'] ||= stripe_customer.address&.city 
            user_profile.metadata['stripe_address_country'] ||= stripe_customer.address&.country
            user_profile.metadata['stripe_address_line1'] ||= stripe_customer.address&.line1
            user_profile.metadata['stripe_address_line2'] ||= stripe_customer.address&.line2
            user_profile.metadata['stripe_address_postal_code'] ||= stripe_customer.address&.postal_code
            user_profile.metadata['stripe_address_state'] ||= stripe_customer.address&.state
          end
          user_profile.save!
          user_profile
        end
      end

      def stripe_customer
        @stripe_customer ||= begin
          if stripe_object.respond_to?(:customer) && stripe_object.customer.present?
            stripe_customer = stripe_object.customer
            if stripe_customer.is_a?(String)
              stripe_customer = ::Stripe::Customer.retrieve(stripe_customer, stripe_account: integration.account_id)
            end
            stripe_customer
          end
        end
      end

      def supplemental_events_to_be_processed
        StripeHelpers::SupplementalEvents::Evaluator.new(
          stripe_event: stripe_event,
          stripe_customer: stripe_customer,
          public_key: parsed_event.swishjam_api_key,
          maybe_user_profile_id: parsed_event.user_profile_id,
        ).parsed_events_for_any_matching_supplemental_events
      end

      def integration
        @integration ||= begin
          if stripe_event.respond_to?(:account) && stripe_event.account.present?
            Integrations::Stripe.includes(:workspace).enabled.find_by_config_attribute("account_id", stripe_event.account)
          end
        end
      end

      def workspace
        @workspace ||= integration&.workspace
      end

      def stripe_object
        stripe_event.data.object
      end

      def stripe_event
        ::Stripe::Event.construct_from(parsed_event.properties)
      end
    end
  end
end