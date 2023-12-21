module Api
  module V1
    class UsersController < BaseController
      include TimeseriesHelper

      def index
        per_page = params[:per_page] || 10
        page = params[:page] || 1
        if params[:q]
          users = ClickHouseQueries::Users::Search.new(current_workspace, query: params[:q], limit: per_page).get
          render json: { users: users }, status: :ok
        else
          where_clause = JSON.parse(params[:where] || {}.to_json)
          users_results = ClickHouseQueries::Users::List.new(current_workspace, where: where_clause, page: page, limit: per_page).get
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
        }[params[:type]].new(public_keys_for_requested_data_source, start_time: start_timestamp, end_time: end_timestamp).timeseries

        comparison_active_users = nil
        if params[:include_comparison]
          comparison_active_users = {
            'daily' => ClickHouseQueries::Users::Active::Timeseries::Daily,
            'weekly' => ClickHouseQueries::Users::Active::Timeseries::Weekly,
            'monthly' => ClickHouseQueries::Users::Active::Timeseries::Monthly
          }[params[:type]].new(public_keys_for_requested_data_source, start_time: comparison_start_timestamp, end_time: comparison_end_timestamp).timeseries
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
        group_by = derived_group_by(start_ts: start_timestamp, end_ts: end_timestamp)

        timeseries_data = current_workspace.analytics_user_profiles.where(created_at: start_timestamp..end_timestamp).send(:"group_by_#{group_by}", :created_at).count
        formatted_timeseries_data = timeseries_data.keys.sort.map do |timestamp|
          OpenStruct.new(date: timestamp, value: timeseries_data[timestamp])
        end
        current_timeseries = DataFormatters::Timeseries.new(
          formatted_timeseries_data,
          start_time: start_timestamp,
          end_time: end_timestamp,
          group_by: group_by,
          value_method: :value,
          date_method: :date,
        ).formatted_data
        
        comparison_timeseries_data = current_workspace.analytics_user_profiles.where(created_at: comparison_start_timestamp..comparison_end_timestamp - 1.second).send(:"group_by_#{group_by}", :created_at).count
        formatted_comparison_timeseries_data = comparison_timeseries_data.keys.sort.map do |timestamp|
          OpenStruct.new(date: timestamp, value: comparison_timeseries_data[timestamp])
        end
        comparison_timeseries = DataFormatters::Timeseries.new(
          formatted_comparison_timeseries_data,
          start_time: comparison_start_timestamp,
          end_time: comparison_end_timestamp,
          group_by: group_by,
          value_method: :value,
          date_method: :date,
        ).formatted_data

        render json: {
          timeseries: current_timeseries,
          comparison_timeseries: comparison_timeseries,
          start_time: start_timestamp,
          end_time: end_timestamp,
          comparison_start_time: comparison_start_timestamp,
          comparison_end_time: comparison_end_timestamp,
          grouped_by: group_by,
        }, status: :ok
      end
    end
  end
end