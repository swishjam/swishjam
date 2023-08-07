module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate_request!

      private

      def authenticate_request!
        if !requested_instance
          render json: { error: 'Not Authorized' }, status: :unauthorized
        end
      end
    end
  end
end