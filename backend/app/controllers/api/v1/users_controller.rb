module Api
  module V1
    class UsersController < BaseController
      include TimeseriesHelper

      def index
        per_page = params[:per_page] || 10
        page = params[:page] || 1
        # I don't think this gets used anywhere, we only use the SearchController currently
        if params[:q]
          users = ClickHouseQueries::Users::Search.new(current_workspace, query: params[:q], limit: per_page).get
          render json: { users: users }, status: :ok
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
          users_results = ClickHouseQueries::Users::List.new(current_workspace, filter_groups: filter_groups, page: page, limit: per_page).get
          render json: {
            users: users_results['users'],
            previous_page: params[:page].to_i > 1 ? params[:page].to_i - 1 : nil,
            next_page: params[:page].to_i < users_results['total_num_pages'] ? params[:page].to_i + 1 : nil,
            total_pages: users_results['total_num_pages'],
            total_num_records: users_results['total_num_users'],
          }, status: :ok
        end
      end

      def count
        counts = ClickHouseQueries::Users::Count.new(current_workspace.id).get
        render json: counts, status: :ok
      end

      def show
        user = current_workspace.analytics_user_profiles.includes(:analytics_organization_profiles).find(params[:id])
        render json: user, serializer: UserProfileSerializer, status: :ok
      end

      def active
        params[:data_source] ||= ApiKey::ReservedDataSources.PRODUCT
        params[:type] ||= 'weekly'
        raise "Invalid `type` provided: #{params[:type]}" unless %w(daily weekly monthly).include?(params[:type])
        active_users = {
          'daily' => ClickHouseQueries::Users::Active::Timeseries::Daily,
          'weekly' => ClickHouseQueries::Users::Active::Timeseries::Weekly,
          'monthly' => ClickHouseQueries::Users::Active::Timeseries::Monthly
        }[params[:type]].new(
          public_keys_for_requested_data_source,
          workspace_id: current_workspace.id, 
          start_time: start_timestamp, 
          end_time: end_timestamp
        ).timeseries

        comparison_active_users = nil
        if params[:include_comparison]
          comparison_active_users = {
            'daily' => ClickHouseQueries::Users::Active::Timeseries::Daily,
            'weekly' => ClickHouseQueries::Users::Active::Timeseries::Weekly,
            'monthly' => ClickHouseQueries::Users::Active::Timeseries::Monthly
          }[params[:type]].new(
            public_keys_for_requested_data_source,
            workspace_id: current_workspace.id, 
            start_time: comparison_start_timestamp, 
            end_time: comparison_end_timestamp
          ).timeseries
        end
        render json: { 
          current_value: active_users.current_value, 
          timeseries: active_users.formatted_data,
          comparison_value: comparison_active_users&.current_value,
          comparison_timeseries: comparison_active_users&.formatted_data,
          grouped_by: active_users.group_by,
          start_time: active_users.start_time,
          end_time: active_users.end_time,
          comparison_start_time: comparison_active_users&.start_time,
          comparison_end_time: comparison_active_users&.end_time,
          data_source: params[:data_source],
        }, status: :ok
      end
      
      def timeseries
        timeseries = ClickHouseQueries::Users::New::Timeseries.new(
          current_workspace.id, 
          start_time: start_timestamp, 
          end_time: end_timestamp
        ).get

        comparison_timeseries = ClickHouseQueries::Users::New::Timeseries.new(
          current_workspace.id,
          start_time: comparison_start_timestamp,
          end_time: comparison_end_timestamp
        ).get

        render json: render_timeseries_json(timeseries, comparison_timeseries), status: :ok
      end

      def unique_properties
        limit = params[:limit] || 100
        properties = ClickHouseQueries::Users::Properties::Unique.new(current_workspace.id, limit: limit).get
        render json: properties, status: :ok
      end

      def unique_property_values
        raise NotImplementedError, 'Endpoint deprecated.'
      end
    end
  end
end