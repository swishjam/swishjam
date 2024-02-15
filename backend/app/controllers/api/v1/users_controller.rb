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
        elsif params[:segment_ids]
          user_segments = current_workspace.user_segments.includes(:user_segment_filters).where(id: params[:segment_ids])
          ClickHouseQueries::Users::List.new(current_workspace, user_segments: user_segments, page: page, limit: per_page).get
          byebug
        else
          users_results = ClickHouseQueries::Users::List.new(current_workspace, page: page, limit: per_page).get
          render json: {
            users: users_results['users'],
            previous_page: params[:page].to_i > 1 ? params[:page].to_i - 1 : nil,
            next_page: params[:page].to_i < users_results['total_num_pages'] ? params[:page].to_i + 1 : nil,
            total_pages: users_results['total_num_pages'],
            total_num_records: users_results['total_num_users'],
          }, status: :ok
        end
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
        properties = JSON.parse((params[:properties] || %w[metadata]).to_s)
        results = properties.map do |property|
          {
            column: property,
            values: ClickHouseQueries::Users::Attributes::UniqueValues.new(current_workspace, column: property).get
          }
        end
        render json: results, status: :ok
      end
    end
  end
end