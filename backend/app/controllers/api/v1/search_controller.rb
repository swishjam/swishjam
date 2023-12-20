module Api
  module V1
    class SearchController < BaseController
      def index
        params[:data_source] ||= 'all'
        query = (params[:q] || params[:query])&.downcase
        limit = params[:limit] || 10
        users = ClickHouseQueries::Users::Search.new(current_workspace, query: query, limit: limit).get
        organizations = current_workspace
                          .analytics_organization_profiles
                          .where('
                            LOWER(name) LIKE :query OR 
                            LOWER(organization_unique_identifier) LIKE :query
                          ', query: "%#{query}%")
                          .order(created_at: :desc)
                          .limit(limit)
        events = ClickHouseQueries::Events::Search.new(public_keys_for_requested_data_source, query: query, limit: limit).query
        render json: {
          users: users,
          organizations: organizations.map{ |o| OrganizationProfileSerializer.new(o) },
          events: events,
          dashboards: []
        }, status: :ok
      end
    end
  end
end