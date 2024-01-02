module Api
  module V1
    module Organizations
      class UsersController < BaseController
        def index
          render json: @organization.analytics_user_profiles, each_serializer: UserProfileSerializer, status: :ok
        end

        def active
          # params[:data_source] ||= ApiKey::ReservedDataSources.PRODUCT
          params[:data_source] = 'all'
          params[:type] ||= 'weekly'
          raise "Invalid `type` provided: #{params[:type]}" unless %w(daily weekly monthly).include?(params[:type])
          
          active_users_klass = {
            'daily' => ClickHouseQueries::Users::Active::Timeseries::Daily,
            'weekly' => ClickHouseQueries::Users::Active::Timeseries::Weekly,
            'monthly' => ClickHouseQueries::Users::Active::Timeseries::Monthly
          }[params[:type]]

          active_users_timeseries = active_users_klass.new(
            public_keys_for_requested_data_source, 
            organization_unique_identifier: @organization.organization_unique_identifier,
            start_time: start_timestamp,
            end_time: end_timestamp
          ).timeseries

          comparison_active_users_timeseries = nil
          if params[:include_comparison]
            comparison_active_users_timeseries = active_users_klass.new(
              public_keys_for_requested_data_source, 
              organization_unique_identifier: @organization.organization_unique_identifier,
              start_time: comparison_start_timestamp,
              end_time: comparison_end_timestamp
            ).timeseries
          end

          render json: { 
            current_value: active_users_timeseries.current_value, 
            timeseries: active_users_timeseries.formatted_data,
            comparison_value: comparison_active_users_timeseries&.current_value, 
            comparison_timeseries: comparison_active_users_timeseries&.formatted_data, 
            start_time: active_users_timeseries.start_time,
            end_time: active_users_timeseries.end_time,
            comparison_start_time: comparison_active_users_timeseries&.start_time,
            comparison_end_time: comparison_active_users_timeseries&.end_time,
            grouped_by: active_users_timeseries.group_by,
          }, status: :ok
        end
      end
    end
  end
end