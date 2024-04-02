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
          filter_groups = []
          if params[:cohort_ids].present?
            cohorts = current_workspace.cohorts.includes(:query_filter_groups).where(id: params[:cohort_ids])
            cohorts.each do |cohort|
              cohort.query_filter_groups.in_sequence_order.each do |filter_group|
                filter_groups << filter_group
              end
            end
          end
          query_results = ClickHouseQueries::Organizations::List.new(current_workspace.id, page: page, limit: per_page, filter_groups: filter_groups).get
          render json: {
            organizations: query_results['organizations'],
            total_pages: query_results['total_num_pages'],
            total_num_records: query_results['total_num_organizations'],
          }, status: :ok
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


      def count
        render json: { count: ClickHouseQueries::Organizations::Count.new(current_workspace.id).get }, status: :ok
      end

      def unique_properties
        limit = params[:limit] || 100
        properties = ClickHouseQueries::Organizations::Properties::Unique.new(current_workspace.id, limit: limit).get
        render json: properties, status: :ok
      end

      private

      def get_organization
        @organization ||= current_workspace.analytics_organization_profiles.find(params[:id])
      end
    end
  end
end