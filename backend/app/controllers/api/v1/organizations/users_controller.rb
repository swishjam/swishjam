module Api
  module V1
    module Organizations
      class UsersController < BaseController
        def index
          render json: @organization.analytics_user_profiles, each_serializer: Analytics::UserSerializer, status: :ok
        end

        def active
          params[:data_source] ||= ApiKey::ReservedDataSources.PRODUCT
          params[:type] ||= 'weekly'
          raise "Invalid `type` provided: #{params[:type]}" unless %w(daily weekly monthly).include?(params[:type])
          active_users_klass = {
            'daily' => ClickHouseQueries::Organizations::Users::Active::Daily,
            'weekly' => ClickHouseQueries::Organizations::Users::Active::Weekly,
            'monthly' => ClickHouseQueries::Organizations::Users::Active::Monthly
          }[params[:type]]
          active_users_timeseries = active_users_klass.new(
            public_keys_for_requested_data_source, 
            organization_profile_id: @organization.id,
            start_time: start_timestamp,
            end_time: end_timestamp
          ).timeseries
          render json: { 
            current_value: active_users_timeseries.current_value, 
            timeseries: active_users_timeseries.formatted_data,
            start_time: active_users_timeseries.start_time,
            end_time: active_users_timeseries.end_time
          }, status: :ok
        end

        def top
          params[:order_by] ||= 'session_count'
          raise "Invalid `order_by` provided: #{params[:order_by]}" unless %w(session_count event_count).include?(params[:order_by])
          users = Analytics::User.joins(devices: { sessions: :events })
                                  .where(analytics_devices: { analytics_sessions: { analytics_organization_id: @organization.id }})
                                  .group('analytics_users.id')
                                  .order("#{params[:order_by]} DESC")
                                  .limit(params[:limit] || 10)
                                  .select('
                                    analytics_users.id, 
                                    analytics_users.first_name,
                                    analytics_users.last_name,
                                    CONCAT(analytics_users.first_name, analytics_users.last_name) AS full_name,
                                    analytics_users.email,
                                    analytics_users.created_at,
                                    COUNT(DISTINCT analytics_sessions.id) AS session_count, 
                                    COUNT(analytics_events.id) AS event_count
                                  ')
          render json: users.to_json, status: :ok
        end
      end
    end
  end
end