module Api
  module V1
    module Organizations
      class BillingController < BaseController
        def index
          most_recent_billing_snapshot = @organization.billing_data_snapshots.most_recent
          current_mrr = most_recent_billing_snapshot&.mrr_in_cents
          lifetime_revenue = most_recent_billing_snapshot&.total_revenue_in_cents
          subscriptions = @organization.subscriptions.includes(:subscription_items)
          render json: {
            current_mrr: current_mrr,
            lifetime_revenue: lifetime_revenue,
            subscriptions: subscriptions.map { |subscription| subscription.as_json(include: :subscription_items) },
            billing_data_last_updated_at: most_recent_billing_snapshot&.created_at
          }, status: :ok
        end
      end
    end
  end
end