module Api
  module V1
    module Users
      class OrganizationsController < BaseController
        def index
          # render json: @user.organizations, each_serializer: OrganizationProfileSerializer, status: :ok
          render json: @user.organizations, status: :ok
        end
      end
    end
  end
end