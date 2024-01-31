def setup_test_data( stub_data: { stripe: { customer_email: 'fake@example.com', customer_name: 'Fake Name' }})
  @swishjam_organization = FactoryBot.create(:swishjam_organization)
  stub_external_apis({ 
    stripe_customer_email: stub_data[:stripe][:customer_email], 
    stripe_customer_name: stub_data[:stripe][:customer_name],
  })
end

def insert_events_into_click_house!(opts = {}) 
  if !block_given?
    raise "Must provide a block of events to insert"
  end
  events = yield.map do |event|
    event[:swishjam_api_key] ||= opts[:public_key]
    event[:uuid] ||= SecureRandom.uuid
    event[:occurred_at] ||= opts[:occurred_at] || Time.current
    event[:ingested_at] ||= opts[:ingested_at] || Time.current
    event[:name] ||= opts[:name]
    event[:properties] = (event[:properties] || {}).to_json
    event
  end
  Analytics::Event.insert_all!(events)
end

def stub_external_apis(stripe_customer_email: 'fake@example.com', stripe_customer_name: 'Fake Name')
  stub_geocoder
  stub_stripe_subscription_list_call(customer_email: stripe_customer_email, customer_name: stripe_customer_name)
  stub_stripe_charge_list_call(customer_email: stripe_customer_email, customer_name: stripe_customer_name)
  stub_stripe_invoice_list_call(customer_email: stripe_customer_email, customer_name: stripe_customer_name)
  stub_stripe_product_retrieve_call(product_name: 'fake_stripe_product_name')
end

def stub_geocoder
  allow(Geocoder).to receive(:search).and_return(
    [
      OpenStruct.new(
        ip: "172.56.21.89", 
        city: "Nashville", 
        region: "Tennessee", 
        country: "US", 
        loc: "36.1659,-86.7844", 
        latitude: 36.1659,
        longitude: -86.7844,
        org: "AS21928 T-Mobile USA, Inc.", 
        postal_code: "37201", 
        timezone: "America/Chicago", 
        readme: "https://ipinfo.io/missingauth"
      )
    ]
  )
end

def stub_stripe_subscription_list_call(customer_email: 'fake@example.com', customer_name: 'Fake Name')
  allow(Stripe::Subscription).to receive(:list).and_return(Stripe::ListObject.construct_from({
    object: 'list',
    has_more: false,
    data: [
      Stripe::Subscription.construct_from({
        id: 'fake_stripe_subscription_id',
        status: 'active',
        created: Time.current.to_i,
        current_period_end: (Time.current + 1.month).to_i,
        canceled_at: nil,
        trial_start: nil,
        trial_end: nil,
        customer: Stripe::Customer.construct_from({
          id: 'fake_stripe_customer_id',
          email: customer_email,
          name: customer_name
        }),
        items: [
          Stripe::SubscriptionItem.construct_from({
            id: 'fake_stripe_subscription_item_id',
            quantity: 1,
            price: Stripe::Price.construct_from({
              id: 'fake_stripe_price_id',
              unit_amount: 1000,
              recurring: Stripe::StripeObject.construct_from({
                interval: 'month',
                interval_count: 1
              }),
              product: 'fake_stripe_product_id',
            })
          })
        ]
      })
    ]
  }))
end

def stub_stripe_charge_list_call(customer_email: 'fake@example.com', customer_name: 'Fake Name')
  allow(Stripe::Charge).to receive(:list).and_return(Stripe::ListObject.construct_from({
    object: 'list',
    has_more: false,
    data: [
      Stripe::Charge.construct_from({
        id: 'fake_stripe_charge_id',
        customer: Stripe::Customer.construct_from({
          id: 'fake_stripe_customer_id',
          email: customer_email,
          name: customer_name
        }),
        amount: 1000,
        status: 'succeeded',
        created: Time.current.to_i
      })
    ]
  }))
end

def stub_stripe_invoice_list_call(customer_email: 'fake@example.com', customer_name: 'Fake Name')
  allow(Stripe::Invoice).to receive(:list).and_return(Stripe::ListObject.construct_from({
    object: 'list',
    has_more: false,
    data: [
      Stripe::Invoice.construct_from({
        id: 'fake_stripe_invoice_id',
        customer: Stripe::Customer.construct_from({
          id: 'fake_stripe_customer_id',
          email: customer_email,
          name: customer_name
        }),
        amount_paid: 1000,
        created: Time.current.to_i
      })
    ]
  }))
end

def stub_stripe_product_retrieve_call(product_name: 'fake_stripe_product_name')
  allow(Stripe::Product).to receive(:retrieve).and_return(Stripe::Product.construct_from({
    id: 'fake_stripe_product_id',
    name: product_name
  }))
end