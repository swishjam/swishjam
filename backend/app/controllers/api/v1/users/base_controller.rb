module Api
  module V1
    module Users
      class BaseController < ::Api::V1::BaseController
        before_action :set_user

        private

        def set_user
          @user ||= current_workspace.analytics_user_profiles.find(params[:user_id])
        end
      end
    end
  end
end