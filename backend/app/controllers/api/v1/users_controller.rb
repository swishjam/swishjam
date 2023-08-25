module Api
  module V1
    class UsersController < BaseController
      def index
        limit = params[:limit] || 10
        users = current_workspace.analytics_user_profiles.order(created_at: :desc).limit(limit)
        render json: users, each_serializer: Analytics::UserSerializer, status: :ok
      end

      def show
        user = current_workspace.analytics_users.find(params[:id])
        render json: user, serializer: Analytics::UserSerializer, status: :ok
      end

      def events
        limit = params[:limit] || 10
        user = current_workspace.analytics_users.find(params[:id])
        events = Analytics::Event.for_user(user).limit(10)
        render json: events, each_serializer: Analytics::EventSerializer, status: :ok
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
      end

      def count
        start_time = params[:start_time] || 7.days.ago
        end_time = params[:end_time] || Time.zone.now

        comparison_start_time = start_time - (end_time - start_time)
        comparison_end_time = start_time

        # TODO: how do we capture _actual_ registration date, rather than when the user was first created?
        render json: {
          count: current_workspace.users.where(created_at: start_time..end_time).count,
          comparison_count: current_workspace.users.where(created_at: comparison_start_time..comparison_end_time).count,
          start_time: start_time,
          end_time: end_time,
          comparison_start_time: comparison_start_time,
          comparison_end_time: comparison_end_time,
        }, status: :ok
      end
      
      def timeseries
        interval = params[:interval] || 'day'
        start_time = { 
          'hour' => Time.zone.now.beginning_of_hour - 1.day, 
          'day' => Time.zone.now.beginning_of_day - 7.days, 
          'week' => Time.zone.now.beginning_of_week - 6.weeks, 
          'month' => Time.zone.now.beginning_of_month - 6.months
        }[interval]
        end_time = Time.zone.now

        comparison_start_time = start_time - (end_time - start_time)
        comparison_end_time = start_time

        json = {
          start_time: start_time,
          end_time: end_time,
          comparison_start_time: comparison_start_time,
          comparison_end_time: comparison_end_time,
        }

        case interval
        when 'hour'
          json[:timeseries] = current_workspace.users.where(created_at: start_time..end_time).group_by_hour(:created_at).count
          json[:comparison_timeseries] = current_workspace.users.where(created_at: comparison_start_time..comparison_end_time - 1.second).group_by_hour(:created_at).count
        when 'day'
          json[:timeseries] = current_workspace.users.where(created_at: start_time..end_time).group_by_day(:created_at).count
          json[:comparison_timeseries] = current_workspace.users.where(created_at: comparison_start_time..comparison_end_time - 1.second).group_by_day(:created_at).count
        when 'week'
          json[:timeseries] = current_workspace.users.where(created_at: start_time..end_time).group_by_week(:created_at).count
          json[:comparison_timeseries] = current_workspace.users.where(created_at: comparison_start_time..comparison_end_time - 1.second).group_by_week(:created_at).count
        when 'month'
          json[:timeseries] = current_workspace.users.where(created_at: start_time..end_time).group_by_month(:created_at).count
          json[:comparison_timeseries] = current_workspace.users.where(created_at: comparison_start_time..comparison_end_time - 1.second).group_by_month(:created_at).count
        else
          render json: { error: "Invalid interval #{interval}, supported values are: 'hour', 'day', 'week', or 'month'." }, status: :bad_request
          return
        end

        render json: json, status: :ok
      end
    end
  end
end