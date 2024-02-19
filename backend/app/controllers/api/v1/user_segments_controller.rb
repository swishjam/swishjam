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
          query_filter_groups_attributes: params[:query_filter_groups].map do |filter_group|
            {
              sequence_index: filter_group[:sequence_index],
              previous_query_filter_group_relationship_operator: filter_group[:previous_query_filter_group_relationship_operator],
              query_filters_attributes: filter_group[:query_filters].map do |filter|
                {
                  sequence_index: filter[:sequence_index],
                  previous_query_filter_relationship_operator: filter[:previous_query_filter_relationship_operator],
                  type: filter[:config][:type],
                  config: filter[:config].except(:type).as_json,
                }
              end
            }
          end
        })
        if user_segment.save
          byebug
          render json: { user_segment: UserSegmentSerializer.new(user_segment) }, status: :ok
        else
          render json: { error: user_segment.errors.full_messages.join(" ") }, status: :unprocessable_entity
        end
      end
    end
  end
end