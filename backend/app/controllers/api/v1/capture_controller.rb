module Api
  module V1
    class CaptureController < ApplicationController
      def process_data
        api_key = request.headers['X-Swishjam-Api-Key']
        if api_key.blank?
          render json: { error: 'Not Authorized' }, status: :unauthorized
          return
        end
        CaptureAnalyticDataJob.perform_async(api_key, JSON.parse(request.body.read), request.ip)
        render json: { message: 'ok' }, status: :ok
      rescue => e
        Rails.logger.error "Error capturing analytic event: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        render json: { error: e.message }, status: :bad_request
      end
    end
  end
end