def mocked_stripe_subscription(
  id: "fake_subscription_#{SecureRandom.hex(4)}",
  status: 'active',
  created: 1.minute.ago,
  current_period_end: Time.current.end_of_month,
  canceled_at: nil,
  trial_start: nil,
  trial_end: nil,
  customer_id: "fake_customer_#{SecureRandom.hex(4)}",
  customer_email: Faker::Internet.email,
  customer_name: Faker::Name.name,
  num_items: 1,
  items_quantities: [1],
  items_unit_amounts: [1_000],
  items_intervals: ['month'],
  items_product_id: 'fake_product_id'
)
  raise "items_quantities must be an array of length #{num_items}" unless items_quantities.length == num_items
  raise "items_unit_amounts must be an array of length #{num_items}" unless items_unit_amounts.length == num_items
  raise "items_intervals must be an array of length #{num_items}" unless items_intervals.length == num_items
  Stripe::Subscription.construct_from(
    id: id,
    status: status,
    created: created,
    current_period_end: current_period_end,
    canceled_at: canceled_at,
    trial_start: trial_start,
    trial_end: trial_end,
    customer: Stripe::Customer.construct_from({
      id: customer_id,
      email: customer_email,
      name: customer_name
    }),
    items: num_items.times.map do |i|
      Stripe::SubscriptionItem.construct_from({
        quantity: items_quantities[i] || items_quantities[0],
        price: Stripe::Price.construct_from({
          unit_amount: items_unit_amounts[i] || items_unit_amounts[0],
          recurring: Stripe::StripeObject.construct_from({ interval: items_intervals[i] || items_intervals[0] }),
          product: items_product_id
        })
      })
    end
  )
end

def mocked_stripe_charge(
  id: "fake_charge_#{SecureRandom.hex(4)}",
  amount: 100_00,
  status: 'succeeded',
  customer_id: "fake_customer_#{SecureRandom.hex(4)}",
  customer_email: Faker::Internet.email,
  customer_name: Faker::Name.name,
  created: 1.minute.ago
)
  Stripe::Charge.construct_from(
    id: id,
    amount: amount,
    status: status,
    created: created,
    customer: Stripe::Customer.construct_from({
      id: customer_id,
      email: customer_email,
      name: customer_name
    }),
  )
end

def mocked_stripe_invoice(id: "fake_invoice_#{SecureRandom.hex(4)}", amount_paid: 100_00, status: 'paid', created: 1.minute.ago)
  Stripe::Invoice.construct_from(id: id, amount_paid: amount_paid, status: status, created: created)
end

def mocked_stripe_customer(id: "fake_customer_#{SecureRandom.hex(4)}", email: Faker::Internet.email, name: Faker::Name.name)
  Stripe::Customer.construct_from(id: id, email: email, name: name)
end