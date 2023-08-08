module Api
  module V1
    class UsersController < BaseController
      def count
        start_time = params[:start_time] || 7.days.ago
        end_time = params[:end_time] || Time.zone.now

        comparison_start_time = start_time - (end_time - start_time)
        comparison_end_time = start_time

        # TODO: how do we capture _actual_ registration date, rather than when the user was first created?
        render json: {
          count: instance.users.where(created_at: start_time..end_time).count,
          comparison_count: instance.users.where(created_at: comparison_start_time..comparison_end_time).count,
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
          json[:timeseries] = instance.users.where(created_at: start_time..end_time).group_by_hour(:created_at).count
          json[:comparison_timeseries] = instance.users.where(created_at: comparison_start_time..comparison_end_time - 1.second).group_by_hour(:created_at).count
        when 'day'
          json[:timeseries] = instance.users.where(created_at: start_time..end_time).group_by_day(:created_at).count
          json[:comparison_timeseries] = instance.users.where(created_at: comparison_start_time..comparison_end_time - 1.second).group_by_day(:created_at).count
        when 'week'
          json[:timeseries] = instance.users.where(created_at: start_time..end_time).group_by_week(:created_at).count
          json[:comparison_timeseries] = instance.users.where(created_at: comparison_start_time..comparison_end_time - 1.second).group_by_week(:created_at).count
        when 'month'
          json[:timeseries] = instance.users.where(created_at: start_time..end_time).group_by_month(:created_at).count
          json[:comparison_timeseries] = instance.users.where(created_at: comparison_start_time..comparison_end_time - 1.second).group_by_month(:created_at).count
        else
          render json: { error: "Invalid interval #{interval}, supported values are: 'hour', 'day', 'week', or 'month'." }, status: :bad_request
          return
        end

        render json: json, status: :ok
      end
    end
  end
end