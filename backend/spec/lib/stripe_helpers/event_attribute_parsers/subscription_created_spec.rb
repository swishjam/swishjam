require 'spec_helper'

describe StripeHelpers::EventAttributeParsers::SubscriptionCreated do
  stripe_event = Stripe::Event.construct_from({
    "id": "evt_1O9cTcLgOjszfy1jBLzuG67Z",
    "object": "event",
    "api_version": "2020-08-27",
    "created": 1699314304,
    "data": {
      "object": {
        "id": "sub_1",
        "object": "subscription",
        "application": nil,
        "application_fee_percent": nil,
        "automatic_tax": {
          "enabled": false
        },
        "billing_cycle_anchor": 1691536406,
        "billing_thresholds": nil,
        "cancel_at": nil,
        "cancel_at_period_end": false,
        "canceled_at": 1699314304,
        "cancellation_details": {
          "comment": nil,
          "feedback": nil,
          "reason": "cancellation_requested"
        },
        "collection_method": "charge_automatically",
        "created": 1691536406,
        "currency": "usd",
        "current_period_end": 1699485206,
        "current_period_start": 1696806806,
        "customer": "cus_1",
        "days_until_due": nil,
        "default_payment_method": nil,
        "default_source": "card_1Ncz5bLgOjszfy1jo379ozgq",
        "default_tax_rates": [],
        "description": nil,
        "discount": nil,
        "ended_at": 1699314304,
        "items": {
          "object": "list",
          "data": [
            {
              "id": "si_OPojh70t8fdVCF",
              "object": "subscription_item",
              "billing_thresholds": nil,
              "created": 1691536406,
              "metadata": {},
              "plan": {
                "id": "price_1KxwLbLgOjszfy1jHRKeZ687",
                "object": "plan",
                "active": true,
                "aggregate_usage": nil,
                "amount": 5999,
                "amount_decimal": "5999",
                "billing_scheme": "per_unit",
                "created": 1652201743,
                "currency": "usd",
                "interval": "month",
                "interval_count": 1,
                "livemode": false,
                "metadata": {},
                "nickname": "Monthly rate",
                "product": "prod_1",
                "tiers_mode": nil,
                "transform_usage": nil,
                "trial_period_days": nil,
                "usage_type": "licensed"
              },
              "price": {
                "id": "price_1KxwLbLgOjszfy1jHRKeZ687",
                "object": "price",
                "active": true,
                "billing_scheme": "per_unit",
                "created": 1652201743,
                "currency": "usd",
                "custom_unit_amount": nil,
                "livemode": false,
                "lookup_key": nil,
                "metadata": {},
                "nickname": "Monthly rate",
                "product": "prod_1",
                "recurring": {
                  "aggregate_usage": nil,
                  "interval": "month",
                  "interval_count": 1,
                  "trial_period_days": nil,
                  "usage_type": "licensed"
                },
                "tax_behavior": "unspecified",
                "tiers_mode": nil,
                "transform_quantity": nil,
                "type": "recurring",
                "unit_amount": 100,
                "unit_amount_decimal": "100"
              },
              "quantity": 2,
              "subscription": "sub_1Ncz5eLgOjszfy1jWCUVxiJm",
              "tax_rates": []
            }
          ],
          "has_more": false,
          "total_count": 1,
          "url": "/v1/subscription_items?subscription=sub_1Ncz5eLgOjszfy1jWCUVxiJm"
        },
        "latest_invoice": "in_1Nz6AdLgOjszfy1jA0W8C4K6",
        "livemode": false,
        "metadata": {},
        "next_pending_invoice_item_invoice": nil,
        "on_behalf_of": nil,
        "pause_collection": nil,
        "payment_settings": {
          "payment_method_options": nil,
          "payment_method_types": nil,
          "save_default_payment_method": "off"
        },
        "pending_invoice_item_interval": nil,
        "pending_setup_intent": nil,
        "pending_update": nil,
        "plan": {
          "id": "price_1KxwLbLgOjszfy1jHRKeZ687",
          "object": "plan",
          "active": true,
          "aggregate_usage": nil,
          "amount": 5999,
          "amount_decimal": "5999",
          "billing_scheme": "per_unit",
          "created": 1652201743,
          "currency": "usd",
          "interval": "month",
          "interval_count": 1,
          "livemode": false,
          "metadata": {},
          "nickname": "Monthly rate",
          "product": "prod_1",
          "tiers_mode": nil,
          "transform_usage": nil,
          "trial_period_days": nil,
          "usage_type": "licensed"
        },
        "quantity": 1,
        "schedule": nil,
        "start_date": 1691536406,
        "status": "canceled",
        "test_clock": nil,
        "transfer_data": nil,
        "trial_end": nil,
        "trial_settings": {
          "end_behavior": {
            "missing_payment_method": "create_invoice"
          }
        },
        "trial_start": nil
      }
    },
    "livemode": false,
    "pending_webhooks": 0,
    "request": {
      "id": nil,
      "idempotency_key": nil
    },
    "type": "customer.subscription.deleted"
  })
  parser = StripeHelpers::EventAttributeParsers::SubscriptionCreated.new(stripe_event)

  describe '#to_json' do
    it 'returns a hash with the correct attributes' do
      expect(parser.to_json).to eq({ 'id' => 'sub_1', 'customer' => 'cus_1', 'amount' => 200, 'products' => 'prod_1' })
    end

    it 'gracefully handles errors in methods_to_capture' do
      parser.class.methods_to_capture = parser.class.methods_to_capture.concat([:non_existent_method])
      expect(Sentry).to receive(:capture_exception).with(NoMethodError).once
      expect(parser.to_json).to eq({ 'id' => 'sub_1', 'customer' => 'cus_1', 'amount' => 200, 'products' => 'prod_1' })
    end
  end
end