module Api
  module V1
    class OrganizationsController < BaseController
      before_action :get_organization, only: [:show, :events, :users]

      def index
        page = params[:page] || 1
        per_page = params[:per_page] || 10
        if params[:q]
          organizations = current_workspace
                            .analytics_organization_profiles
                            .where('
                              LOWER(name) LIKE :query OR 
                              LOWER(organization_unique_identifier) LIKE :query
                            ', query: "%#{params[:q].downcase}%")
                            .order(created_at: :desc)
                            .page(page)
                            .per(per_page)
          render json: {
            organizations: organizations.map{ |o| OrganizationProfileSerializer.new(o) },
            previous_page: organizations.prev_page,
            next_page: organizations.next_page,
            total_pages: organizations.total_pages,
            total_num_records: organizations.total_count,
          }, each_serializer: OrganizationProfileSerializer, status: :ok
        else
          organizations = current_workspace
                            .analytics_organization_profiles
                            .order(created_at: :desc)
                            .page(page)
                            .per(per_page)
          render json: {
            organizations: organizations.map{ |o| OrganizationProfileSerializer.new(o) },
            previous_page: organizations.prev_page,
            next_page: organizations.next_page,
            total_pages: organizations.total_pages,
            total_num_records: organizations.total_count,
          }, each_serializer: OrganizationProfileSerializer, status: :ok
        end
      end

      def show
        render json: @organization, serializer: OrganizationProfileSerializer, status: :ok
      end

      def events
        limit = params[:limit] || 10
        events = Analytics::Event.for_organization(@organization).order(created_at: :desc).limit(limit)
        render json: events, status: :ok  
      end

      private

      def get_organization
        @organization ||= current_workspace.analytics_organization_profiles.find(params[:id])
      end
    end
  end
end