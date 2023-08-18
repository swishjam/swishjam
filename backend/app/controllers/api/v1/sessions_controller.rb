module Api
  module V1
    class SessionsController < BaseController
      def count
        start_time = params[:start_time] || 7.days.ago
        end_time = params[:end_time] || Time.zone.now

        comparison_start_time = start_time - (end_time - start_time)
        comparison_end_time = start_time

        render json: {
          count: current_organization.analytics_sessions.where(start_time: start_time..end_time).count,
          comparison_count: current_organization.analytics_sessions.where(start_time: comparison_start_time..comparison_end_time).count,
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
          json[:timeseries] = format_timeseries(current_organization.analytics_sessions.where(start_time: start_time..end_time).group_by_hour(:start_time).count)
          json[:comparison_timeseries] = format_timeseries(current_organization.analytics_sessions.where(start_time: comparison_start_time..comparison_end_time - 1.second).group_by_hour(:start_time).count)
        when 'day'
          json[:timeseries] = format_timeseries(current_organization.analytics_sessions.where(start_time: start_time..end_time).group_by_day(:start_time).count)
          json[:comparison_timeseries] = format_timeseries(current_organization.analytics_sessions.where(start_time: comparison_start_time..comparison_end_time - 1.second).group_by_day(:start_time).count)
        when 'week'
          json[:timeseries] = format_timeseries(current_organization.analytics_sessions.where(start_time: start_time..end_time).group_by_week(:start_time).count)
          json[:comparison_timeseries] = format_timeseries(current_organization.analytics_sessions.where(start_time: comparison_start_time..comparison_end_time - 1.second).group_by_week(:start_time).count)
        when 'month'
          json[:timeseries] = format_timeseries(current_organization.analytics_sessions.where(start_time: start_time..end_time).group_by_month(:start_time).count)
          json[:comparison_timeseries] = format_timeseries(current_organization.analytics_sessions.where(start_time: comparison_start_time..comparison_end_time - 1.second).group_by_month(:start_time).count)
        else
          render json: { error: "Invalid interval #{interval}, supported values are: 'hour', 'day', 'week', or 'month'." }, status: :bad_request
          return
        end

        json[:count] = json[:timeseries].collect{ |h| h[:value] }.sum
        json[:comparison_count] = json[:comparison_timeseries].collect{ |h| h[:value] }.sum

        render json: json, status: :ok
      end

      def referrers
        start_time = params[:start_time] || 7.days.ago
        end_time = params[:end_time] || Time.zone.now

        render json: {
          referrers: Analytics::PageHit.first_of_sessions(current_organization).where(start_time: start_time..end_time).group(:referrer_url_host).count,
          start_time: start_time,
          end_time: end_time,
        }, status: :ok
      end
    end
  end
end