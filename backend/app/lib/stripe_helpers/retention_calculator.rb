module StripeHelpers
  class RetentionCalculator
    def initialize(workspace_id:, stripe_account_id:)
      @workspace_id = workspace_id
      @stripe_account_id = stripe_account_id
    end

    def create_revenue_retention_periods_for_time_period!
      formatted_for_insert = monthly_retention.map do |cohort_time_period, cohort_data|
        cohort_data[:retention].map do |retention_period_date, retention_period_mrr_in_cents|
          {
            workspace_id: @workspace_id,
            cohort_date: cohort_time_period,
            cohort_starting_mrr_in_cents: cohort_data[:starting_mrr],
            cohort_starting_num_subscriptions: cohort_data[:num_subscriptions],
            retention_period_date: retention_period_date,
            retention_period_mrr_in_cents: retention_period_mrr_in_cents, 
            # I don't think this is possible to calculate in our current setup
            # retention_period_num_subscriptions: retention_period_num_subscriptions,
            calculated_at: Time.current,
          }
        end
      end.flatten
      Analytics::RevenueMonthlyRetentionPeriod.insert_all!(formatted_for_insert) if formatted_for_insert.any?
    end
    
    def monthly_retention
      @monthly_retention ||= calc_retention(group_by: :month)
    end

    # def weekly_retention
    #   @weekly_retention ||= calc_retention(group_by: :week)
    # end

    def flush_cache!
      @weekly_retention = nil
      @monthly_retention = nil
    end
    
    private

    def calc_retention(group_by:)
      retention = {}
      paid_invoices_for_all_of_time.each do |invoice|
        next if invoice.subscription.nil?
        time_of_subscription_start = invoice.subscription.trial_end.present? ? invoice.subscription.trial_end : invoice.subscription.start_date
        cohort_time_period = Time.at(time_of_subscription_start).utc.send(:"beginning_of_#{group_by}")
        # invoice_created_time_period = Time.at(invoice.created).send(:"beginning_of_#{group_by}")
        retention[cohort_time_period] ||= { num_subscriptions: 0, starting_mrr: 0, unique_subscriptions_for_cohort: Set.new, retention: {} }

        retention[cohort_time_period][:unique_subscriptions_for_cohort].add(invoice.subscription.id)
        retention[cohort_time_period][:num_subscriptions] = retention[cohort_time_period][:unique_subscriptions_for_cohort].size
        # I think this is the best way to check if this is the first invoice for a subscription 
        # sometimes there's a few seconds of delay between the subscription being created and the first invoice being created
        # we use the first invoice to determine MRR because Stripe makes it hard to get data from a subscription at a point in time
        invoice_is_first_for_subscription = (-1 * (invoice.subscription.start_date - invoice.created) < 1.minute) ||
                                              (invoice.subscription.trial_end.present? && -1 * (invoice.subscription.trial_end - invoice.created) < 1.minute)
        invoice.lines.data.each do |line| 
          next if line.amount.zero?
          mrr_for_line_item = StripeHelpers::MrrCalculator.mrr_for_subscription_item(
            interval: line.plan.interval, 
            unit_amount: line.unit_amount_excluding_tax.to_i, 
            quantity: line.quantity, 
            interval_count: line.plan.interval_count
          )
          retention[cohort_time_period][:starting_mrr] += mrr_for_line_item if invoice_is_first_for_subscription
          start_date_for_line_item = Time.at(line.period.start).utc
          while start_date_for_line_item < Time.at(line.period.end).utc
            normalized_time_period_to_attribute_recognized_mrr_for = start_date_for_line_item.send(:"beginning_of_#{group_by}")
            retention[cohort_time_period][:retention][normalized_time_period_to_attribute_recognized_mrr_for] ||= 0
            retention[cohort_time_period][:retention][normalized_time_period_to_attribute_recognized_mrr_for] += mrr_for_line_item
            start_date_for_line_item += 1.send(group_by)
          end
        end
      end
      fill_in_retention_results!(retention, group_by)
      retention
    end

    def fill_in_retention_results!(retention, group_by)
      current_cohort_date = retention.keys.min
      return if current_cohort_date.nil?
      while current_cohort_date <= Time.current
        retention[current_cohort_date] ||= { num_subscriptions: 0, starting_mrr: 0, retention: {} }
        retention[current_cohort_date].delete(:unique_subscriptions_for_cohort)
        current_cohort_date += 1.send(group_by)
      end
      retention.each do |cohort_time_period, cohort_data|
        current_retention_date = cohort_time_period
        while current_retention_date <= Time.current
          cohort_data[:retention][current_retention_date] ||= 0
          current_retention_date += 1.send(group_by)
        end
      end
    end

    def paid_invoices_for_all_of_time
      @paid_invoices_for_all_of_time ||= begin
        StripeHelpers::DataFetchers.get_all { ::Stripe::Invoice.list({ status: 'paid', expand: ['data.customer', 'data.subscription'] }, stripe_account: @stripe_account_id) }
      end
    end
  end
end