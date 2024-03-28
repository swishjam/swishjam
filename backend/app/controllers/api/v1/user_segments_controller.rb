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

      def sql
        user_segment = current_workspace.user_segments.find(params[:id])
        sql = ClickHouseQueries::Users::List.new(current_workspace, filter_groups: user_segment.query_filter_groups.in_sequence_order).sql
        render json: { user_segment: UserSegmentSerializer.new(user_segment), sql: sql }, status: :ok
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
              # id: filter_group[:id],
              sequence_index: filter_group[:sequence_index],
              previous_query_filter_group_relationship_operator: filter_group[:previous_query_filter_group_relationship_operator],
              query_filters_attributes: filter_group[:query_filters].map do |filter|
                {
                  # id: filter[:id],
                  sequence_index: filter[:sequence_index],
                  previous_query_filter_relationship_operator: filter[:previous_query_filter_relationship_operator],
                  type: filter[:type],
                  config: filter[:config].as_json,
                }
              end
            }
          end
        }
        update_config_errors = []
        attrs[:query_filter_groups_attributes].each do |group|
          group[:query_filters_attributes].each do |filter|
            filter_class = filter[:type].constantize
            filter_class.required_config_keys.each do |key|
              update_config_errors << "Missing required config key: #{key}" unless filter[:config].key?(key.to_s)
            end
            if filter_class == QueryFilters::EventCountForUserOverTimePeriod
              update_config_errors << "Invalid event_count_operator" unless %w[less_than less_than_or_equal_to greater_than greater_than_or_equal_to].include?(filter[:config]['event_count_operator'])
            elsif filter_class == QueryFilters::UserProperty
              if !%w[is_defined is_not_defined is_not_generic_email is_generic_email].include?(filter[:config]['operator']) && filter[:config][:property_value].blank?
                update_config_errors << "`property_value` query filter option is required for operator: #{filter[:config]['operator']}"
              end
              if %w[is_generic_email is_not_generic_email].include?(filter[:config]['operator'])  && filter[:config]['property_name'] != 'email'
                update_config_errors << "`property_name` must be 'email' when using the `is/is not generic` operator."
              end
            end
          end
        end
        if update_config_errors.any?
          render json: { error: update_config_errors.join(" ") }, status: :unprocessable_entity
          return
        end
        user_segment.query_filter_groups.destroy_all
        if user_segment.update(attrs)
          render json: { user_segment: UserSegmentSerializer.new(user_segment) }, status: :ok
        else
          Sentry.capture_message("Failed to update user segment, this shouldnt happen cause we assume its always valid.")
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