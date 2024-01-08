module StripeHelpers
  class RetentionCalculator
    def initialize(stripe_account_id)
      @stripe_account_id = stripe_account_id
    end

    def weekly_retention
      @weekly_retention ||= calc_retention(group_by: :week)
    end

    def monthly_retention
      @monthly_retention ||= calc_retention(group_by: :month)
    end
    
    private

    def calc_retention(group_by:)
      retention = {}
      invoices_for_all_of_time.each do |invoice|
        next if invoice.subscription.nil?
        cohort_time_period = Time.at(invoice.subscription.created).send(:"beginning_of_#{group_by}")
        invoice_created_time_period = Time.at(invoice.created).send(:"beginning_of_#{group_by}")
        retention[cohort_time_period] ||= {}
        mrr_in_cents = invoice.lines.data.sum do |line| 
          num_days_for_line_item = (line.period.end - line.period.start) / 1.day
          line.amount ? line.amount / num_days_for_line_item * 30 : 0
        end
        if mrr_in_cents == 0
          byebug
        end
        retention[cohort_time_period][invoice_created_time_period] ||= 0
        retention[cohort_time_period][invoice_created_time_period] += mrr_in_cents / 100.0
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