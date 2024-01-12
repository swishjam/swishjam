module StripeHelpers
  module BackFillers
    class SupplementalChargeSucceeded < Base
      self.default_starting_from = 1.year.ago

      def enqueue_supplemental_charge_events_to_be_ingested!
        events = charges_for_all_of_time.map do |charge|
          next if charge.status != 'succeeded'
          Analytics::Event.formatted_for_ingestion(
            ingested_at: Time.current,
            uuid: "#{charge.id}-supplemental-charge",
            swishjam_api_key: public_key,
            name: StripeHelpers::SupplementalEvents::Types.CHARGE_SUCCEEDED,
            occurred_at: Time.at(charge.created),
            properties: {
              stripe_charge_id: charge.id,
              stripe_customer_id: charge.customer&.id,
              stripe_customer_email: charge.customer&.email,
              amount_in_cents: charge.amount,
            },
          )
        end.compact
        return events.count if !events.any?
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events) 
        events.count
      end

      private

      def charges_for_all_of_time
        StripeHelpers::DataFetchers.get_all do
          Stripe::Charge.list({ limit: 100, expand: ['data.customer'], created: { gte: starting_from.to_i }}, stripe_account: stripe_account_id)
        end
      end
    end
  end
end