module Api
  module V1
    class SessionsController < BaseController
      def count
        start_time = params[:start_time] || 7.days.ago
        end_time = params[:end_time] || Time.now

        comparison_start_time = start_time - (end_time - start_time)
        comparison_end_time = start_time

        render json: {
          count: instance.sessions.where(start_time: start_time..end_time).count,
          comparison_count: instance.sessions.where(start_time: comparison_start_time..comparison_end_time).count,
          start_time: start_time,
          end_time: end_time,
          comparison_start_time: comparison_start_time,
          comparison_end_time: comparison_end_time,
        }, status: :ok
      end
    end
  end
end