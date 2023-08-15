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

      def current_organization
        @current_organization ||= Swishjam::Organization.find_by(id: decoded_jwt_token['current_organization']['id'])
      end
      
      def current_user
        @current_user ||= Swishjam::User.find_by(id: decoded_jwt_token['user_id'])
      end

      def jwt_token
        @jwt_token ||= request.headers['X-Swishjam-Token']
      end

      def decoded_jwt_token
        @decoded_jwt_token ||= JWT.decode(jwt_token, nil, false)[0]
      end

      def is_valid_session?
        return false if jwt_token.blank?
        Swishjam::Session.exists?(jwt_value: jwt_token)
      end
    end
  end
end