module Api
  module V1
    class SearchController < BaseController
      def index
        query = (params[:q] || params[:query])&.downcase
        limit = params[:limit] || 10
        users = current_workspace
                  .analytics_user_profiles
                  .includes(:analytics_organization_profiles)
                  .where('
                    LOWER(email) LIKE :query OR 
                    LOWER(first_name) LIKE :query OR 
                    LOWER(last_name) LIKE :query OR 
                    LOWER(user_unique_identifier) LIKE :query OR
                    LOWER(first_name) || \' \' || LOWER(last_name) LIKE :query
                  ', query: "%#{query}%")
                  .order(created_at: :desc)
                  .limit(limit)
        organizations = current_workspace
                          .analytics_organization_profiles
                          .where('
                            LOWER(name) LIKE :query OR 
                            LOWER(organization_unique_identifier) LIKE :query
                          ', query: "%#{query}%")
                          .order(created_at: :desc)
                          .limit(limit)
        render json: {
          users: users.map{ |u| UserProfileSerializer.new(u) },
          organizations: organizations.map{ |o| OrganizationProfileSerializer.new(o) },
          dashboards: []
        }, status: :ok
      end
    end
  end
end