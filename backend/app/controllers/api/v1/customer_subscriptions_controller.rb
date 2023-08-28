module Api
  module V1
    class CustomerSubscriptionsController < BaseController
      def index
        render json: current_workspace.analytics_customer_subscriptions, status: :ok
      end
    end
  end
end