module Api
  module V1
    class UrlSegmentsController < BaseController
      def index
        render json: current_workspace.url_segments, status: :ok
      end

      def create
        url_segment = current_workspace.url_segments.new(url_segment_params)
        if url_segment.save
          render json: { url_segment: url_segment }, status: :created
        else
          render json: { error: url_segment.errors.full_messages.join('. ')}, status: :unprocessable_entity
        end
      end

      def destroy
        url_segment = current_workspace.url_segments.find(params[:id])
        if url_segment.destroy
          render json: { url_segment: url_segment }, status: :ok
        else
          render json: { error: url_segment.errors.full_messages.join('. ')}, status: :unprocessable_entity
        end
      end

      private

      def url_segment_params
        params.require(:url_segment).permit(:name, :url_host)
      end
    end
  end
end