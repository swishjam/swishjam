module Api
  module V1
    class UserSegmentsController < BaseController
      def index
        user_segments = current_workspace.user_segments.includes(query_filter_groups: :query_filters).order(created_at: :desc)
        render json: user_segments, each_serializer: UserSegmentSerializer, status: :ok
      end

      def show
        user_segment = current_workspace.user_segments.find(params[:id])
        render json: { user_segment: UserSegmentSerializer.new(user_segment) }, status: :ok
      end

      def destroy
        user_segment = current_workspace.user_segments.find(params[:id])
        if user_segment.destroy
          render json: { deleted: true, user_segment: UserSegmentSerializer.new(user_segment) }, status: :ok
        else
          render json: { error: user_segment.errors.full_messages.join(" ") }, status: :unprocessable_entity
        end
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
                  type: filter[:type],
                  config: filter[:config].as_json,
                }
              end
            }
          end
        })
        if user_segment.save
          render json: { user_segment: UserSegmentSerializer.new(user_segment) }, status: :ok
        else
          render json: { error: user_segment.errors.full_messages.join(" ") }, status: :unprocessable_entity
        end
      end

      def update
        user_segment = current_workspace.user_segments.find(params[:id])
        attrs = {
          name: params[:name],
          description: params[:description],
          query_filter_groups_attributes: params[:query_filter_groups].map do |filter_group|
            {
              id: filter_group[:id],
              sequence_index: filter_group[:sequence_index],
              previous_query_filter_group_relationship_operator: filter_group[:previous_query_filter_group_relationship_operator],
              query_filters_attributes: filter_group[:query_filters].map do |filter|
                {
                  id: filter[:id],
                  sequence_index: filter[:sequence_index],
                  previous_query_filter_relationship_operator: filter[:previous_query_filter_relationship_operator],
                  type: filter[:type],
                  config: filter[:config].as_json,
                }
              end
            }
          end
        }
        query_filter_groups_attrs_to_destroy = user_segment.query_filter_groups.map(&:id) - attrs[:query_filter_groups_attributes].map { |fg| fg[:id] }
        query_filter_attrs_to_destroy = user_segment.query_filter_groups.flat_map{ |group| group.query_filters.map(&:id) } - attrs[:query_filter_groups_attributes].flat_map { |group| group[:query_filters_attributes].map { |f| f[:id] } }
        query_filter_groups_attrs_to_destroy.each do |id|
          attrs[:query_filter_groups_attributes] << { id: id, _destroy: true }
        end
        query_filter_attrs_to_destroy.each do |id|
          query_filter_group_for_filter = user_segment.query_filter_groups.joins(:query_filters).find_by(query_filters: { id: id })
          attrs[:query_filter_groups_attributes].each do |group|
            # if group[:query_filters_attributes] = nil, then the entire group will be deleted anyway
            if group[:id] == query_filter_group_for_filter.id && group[:_destroy].nil?
              group[:query_filters_attributes] << { id: id, _destroy: true }
            end
          end
        end
        if user_segment.update(attrs)
          render json: { user_segment: UserSegmentSerializer.new(user_segment) }, status: :ok
        else
          render json: { error: user_segment.errors.full_messages.join(" ") }, status: :unprocessable_entity
        end
      end

      def preview
        query_filter_groups = params[:query_filter_groups].map do |filter_group|
          QueryFilterGroup.new(
            sequence_index: filter_group[:sequence_index],
            previous_query_filter_group_relationship_operator: filter_group[:previous_query_filter_group_relationship_operator],
            query_filters_attributes: filter_group[:query_filters].map do |filter|
              {
                sequence_index: filter[:sequence_index],
                previous_query_filter_relationship_operator: filter[:previous_query_filter_relationship_operator],
                type: filter[:type],
                config: filter[:config].as_json,
              }
            end
          )
        end
        users_results = ClickHouseQueries::Users::List.new(
          current_workspace.id, 
          filter_groups: query_filter_groups, 
          page: (params[:page] || 1).to_i, 
          limit: (params[:limit] || 10).to_i
        ).get
        render json: {
          users: users_results['users'],
          previous_page: params[:page].to_i > 1 ? params[:page].to_i - 1 : nil,
          next_page: params[:page].to_i < users_results['total_num_pages'] ? params[:page].to_i + 1 : nil,
          total_pages: users_results['total_num_pages'],
          total_num_records: users_results['total_num_users'],
        }, status: :ok
      end
    end
  end
end