module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate_request!

      private

      def authenticate_request!
        if !is_valid_session?
          render json: { error: 'Not Authorized', logged_out: true }, status: :unauthorized
        end
      end
    end
  end
end