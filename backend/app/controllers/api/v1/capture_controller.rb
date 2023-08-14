module Api
  module V1
    class CaptureController < BaseController
      skip_before_action :authenticate_request!

      def process_data
        api_key = request.headers['X-Swishjam-Api-Key']
        CaptureAnalyticDataJob.perform_async(@api_key, JSON.parse(request.body.read))
        render json: { message: 'ok' }, status: :ok
      rescue => e
        Rails.logger.error "Error capturing analytic event: #{e.message}"
        render json: { error: e.message }, status: :bad_request
      end
    end
  end
end