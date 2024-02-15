module Api
  module V1
    class UserSegmentsController < BaseController
      def index
        user_segments = current_workspace.user_segments
        render json: user_segments, each_serializer: UserSegmentSerializer, status: :ok
      end

      def show
        user_segment = current_workspace.user_segments.find(params[:id])
        render json: { user_segment: UserSegmentSerializer.new(user_segment) }, status: :ok
      end

      def create
        user_segment = current_workspace.user_segments.new({
          name: params[:name],
          description: params[:description],
          created_by_user: current_user,
          user_segment_filters_attributes: params[:filters].map do |filter|
            {
              sequence_position: filter[:sequence_position],
              parent_relationship_operator: filter[:parent_relationship_operator],
              config: filter[:filter_config].as_json,
            }
          end
        })
        if user_segment.save
          render json: UserSegmentSerializer.new(user_segment), status: :ok
        else
          render json: { errors: user_segment.errors.full_messages }, status: :unprocessable_entity
        end
      end
    end
  end
end