module Api
  module V1
    class OrganizationsController < BaseController
      def index
        limit = params[:limit] || 10
        organizations = current_organization.analytics_organizations.order(created_at: :desc).limit(limit)
        render json: organizations, each_serializer: Analytics::OrganizationSerializer, status: :ok
      end
    end
  end
end