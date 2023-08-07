module Api
  module V1
    class CaptureController < ApplicationController
      def process_data
        ProcessDataJob.perform_async(@api_key, JSON.parse(request.body.read))
        render json: { message: 'ok' }, status: :ok
      end
    end
  end
end