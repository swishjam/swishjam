module Api
  module V1
    module Organizations
      class UsersController < BaseController
        def index
          @users = @organization.users
          render json: @users, status: :ok
        end

        def active
          params[:type] ||= 'weekly'
          raise "Invalid `type` provided: #{params[:type]}" unless %w(daily weekly monthly).include?(params[:type])
        active_users_calculator = {
          'daily' => ClickHouseQueries::Users::Active::Daily,
          'weekly' => ClickHouseQueries::Users::Active::Weekly,
          'monthly' => ClickHouseQueries::Users::Active::Monthly
        }[params[:type]].new(current_workspace.public_key)
        render json: {
          current_value: active_users_calculator.current_value,
          timeseries: active_users_calculator.timeseries
        }, status: :ok
          # raise "Invalid `type` provided: #{params[:type]}" unless %w(daily weekly monthly).include?(params[:type])
          # active_users_calculator = {
          #   'daily' => ActiveUserCalculators::Daily,
          #   'weekly' => ActiveUserCalculators::Weekly,
          #   'monthly' => ActiveUserCalculators::Monthly
          # }[params[:type]].new(@organization)
          # render json: {
          #   current_value: active_users_calculator.current_value,
          #   timeseries: active_users_calculator.timeseries
          # }, status: :ok
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