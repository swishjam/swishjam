module Api
  module V1
    class OrganizationsController < BaseController
      before_action :get_organization, only: [:show, :events, :users]

      def index
        limit = params[:limit] || 10
        organizations = current_workspace.analytics_organization_profiles.order(created_at: :desc).limit(limit)
        render json: organizations, each_serializer: Analytics::OrganizationSerializer, status: :ok
      end

      def show
        render json: @organization, serializer: Analytics::OrganizationSerializer, status: :ok
      end

      def events
        limit = params[:limit] || 10
        events = Analytics::Event.for_organization(@organization).order(created_at: :desc).limit(limit)
        render json: events, each_serializer: Analytics::EventSerializer, status: :ok  
      end

      private

      def get_organization
        @organization ||= current_workspace.analytics_organization_profiles.find(params[:id])
      end
    end
  end
end