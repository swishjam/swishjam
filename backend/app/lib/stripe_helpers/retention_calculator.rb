module StripeHelpers
  class RetentionCalculator
    def initialize(workspace_id:, stripe_account_id:)
      @workspace_id = workspace_id
      @stripe_account_id = stripe_account_id
    end

    def create_revenue_retention_periods_for_time_period!(start_timestamp:, end_timestamp:)
      retention = calc_retention(group_by: :month)
      formatted_for_insert = retention.map do |cohort_time_period, cohort_data|
        cohort_data[:retention].map do |retention_period_date, retention_period_mrr_in_cents|
          {
            workspace_id: @workspace_id,
            cohort_date: cohort_time_period,
            cohort_starting_mrr_in_cents: cohort_data[:starting_mrr],
            cohort_starting_num_subscriptions: cohort_data[:num_subscriptions],
            retention_period_date: retention_period_date,
            # I don't think this is possible to calculate in our current setup
            # retention_period_mrr_in_cents: retention_period_mrr_in_cents, 
            calculated_at: Time.current,
          }
        end
      end.flatten
      Analytics::RevenueMonthlyRetentionPeriod.insert_all!(formatted_for_insert)
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
      invoices_for_all_of_time.each do |invoice|
        next if invoice.subscription.nil?
        cohort_time_period = Time.at(invoice.subscription.created).send(:"beginning_of_#{group_by}")
        invoice_created_time_period = Time.at(invoice.created).send(:"beginning_of_#{group_by}")
        retention[cohort_time_period] ||= { num_subscriptions: 0, starting_mrr: 0, retention: {} }
        mrr_in_cents = invoice.lines.data.sum do |line| 
          next if line.amount.zero?
          num_days_for_line_item = (line.period.end - line.period.start) / 1.day
          line.amount / num_days_for_line_item * 30
        end
        invoice_is_first_for_subscription = invoice.subscription.created == invoice.created
        if invoice_is_first_for_subscription
          retention[cohort_time_period][:starting_mrr] += mrr_in_cents
        end
        retention[cohort_time_period][:num_subscriptions] += 1
        retention[cohort_time_period][:retention][invoice_created_time_period] ||= 0
        retention[cohort_time_period][:retention][invoice_created_time_period] += mrr_in_cents
      end
      retention.each do |cohort_time_period, cohort_data|
        current_date = cohort_time_period
        while current_date <= Time.current
          cohort_data[:retention][current_date] ||= 0
          current_date = current_date + 1.send(group_by)
        end
      end
      retention
    end

    def invoices_for_all_of_time
      @invoices_for_all_of_time ||= begin
        StripeHelpers::DataFetchers.get_all { ::Stripe::Invoice.list({ expand: ['data.customer', 'data.subscription'] }, stripe_account: @stripe_account_id) }
      end
    end
  end
end