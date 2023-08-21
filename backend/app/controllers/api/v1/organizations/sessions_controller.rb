module Api
  module V1
    module Organizations
      class SessionsController < BaseController
        include TimeseriesHelper

        def timeseries
        current_sessions = @organization.sessions.starting_after(start_timestamp).starting_at_or_before(end_timestamp)
        comparison_sessions = @organization.sessions.starting_after(comparison_start_timestamp).starting_at_or_before(comparison_end_timestamp)
        json = {
          timeseries: format_timeseries(current_sessions.send(group_by_method, :start_time).count),
          comparison_timeseries: format_timeseries(comparison_sessions.send(group_by_method, :start_time).count),
          start_time: start_timestamp,
          end_time: end_timestamp,
          comparison_start_time: comparison_start_timestamp,
          comparison_end_time: comparison_end_timestamp,
          grouped_by: group_by_method.to_s.split('_').last,
        }
        
        json[:count] = json[:timeseries].collect{ |h| h[:value] }.sum
        json[:comparison_count] = json[:comparison_timeseries].collect{ |h| h[:value] }.sum

        render json: json, status: :ok
        end
      end
    end
  end
end