module Api
  module V1
    class SessionsController < BaseController
      def count
        render json: { count: 100 }, status: :ok
      end
    end
  end
end