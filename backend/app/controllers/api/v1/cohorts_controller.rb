module Api
  module V1
    class CohortsController < BaseController
      def index
        if params[:type]
          cohorts = current_workspace.cohorts.includes(query_filter_groups: :query_filters).where(type: params[:type]).order(created_at: :desc)
          render json: cohorts, each_serializer: CohortSerializer, status: :ok
        else
          cohorts = current_workspace.cohorts.includes(query_filter_groups: :query_filters).order(created_at: :desc)
          render json: cohorts, each_serializer: CohortSerializer, status: :ok
        end
      end

      def show
        cohort = current_workspace.cohorts.find(params[:id])
        render json: { cohort: CohortSerializer.new(cohort) }, status: :ok
      end

      def sql
        cohort = current_workspace.cohorts.find(params[:id])
        sql = nil
        if cohort.is_a?(Cohorts::UserCohort)
          sql = ClickHouseQueries::Users::List.new(current_workspace, filter_groups: cohort.query_filter_groups.in_sequence_order).sql
        elsif cohort.is_a?(Cohorts::OrganizationCohort)
          sql = ClickHouseQueries::Organizations::List.new(current_workspace, filter_groups: cohort.query_filter_groups.in_sequence_order).sql
        else
          render json: { error: "Invalid cohort type" }, status: :unprocessable_entity
          return
        end
        render json: { cohort: CohortSerializer.new(cohort), sql: sql }, status: :ok
      end

      def destroy
        cohort = current_workspace.cohorts.find(params[:id])
        if cohort.destroy
          render json: { deleted: true, cohort: CohortSerializer.new(cohort) }, status: :ok
        else
          render json: { error: cohort.errors.full_messages.join(" ") }, status: :unprocessable_entity
        end
      end

      def create
        cohort = current_workspace.cohorts.new({
          type: params[:type],
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
        if cohort.save
          render json: { cohort: CohortSerializer.new(cohort) }, status: :ok
        else
          render json: { error: cohort.errors.full_messages.join(" ") }, status: :unprocessable_entity
        end
      end

      def update
        cohort = current_workspace.cohorts.find(params[:id])
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
            if filter_class == QueryFilters::EventCountForUserOverTimePeriod || filter_class == QueryFilters::EventCountForProfileOverTimePeriod
              update_config_errors << "Invalid event_count_operator" unless %w[less_than less_than_or_equal_to greater_than greater_than_or_equal_to].include?(filter[:config]['event_count_operator'])
            elsif filter_class == QueryFilters::UserProperty || filter_class == QueryFilters::ProfileProperty
              if !%w[is_defined is_not_defined is_not_generic_email is_generic_email].include?(filter[:config]['operator']) && !filter[:config].key?('property_value')
                update_config_errors << "`property_value` query filter option is required for operator: #{filter[:config]['operator']}"
              end
              if %w[is_generic_email is_not_generic_email].include?(filter[:config]['operator'])  && filter[:config]['property_name'] != 'email'
                update_config_errors << "`property_name` must equal 'email' when using the `is/is not generic` operator."
              end
            end
          end
        end
        if update_config_errors.any?
          render json: { error: update_config_errors.join(" ") }, status: :unprocessable_entity
          return
        end
        cohort.query_filter_groups.destroy_all
        if cohort.update(attrs)
          render json: { cohort: CohortSerializer.new(cohort) }, status: :ok
        else
          Sentry.capture_message("Failed to update cohort, this shouldnt happen cause we assume its always valid.")
          render json: { error: cohort.errors.full_messages.join(" ") }, status: :unprocessable_entity
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
        if params[:profile_type] == 'user'
          users_results = ClickHouseQueries::Users::List.new(
            current_workspace.id, 
            filter_groups: query_filter_groups, 
            page: (params[:page] || 1).to_i, 
            limit: (params[:limit] || 10).to_i
          ).get
          render json: {
            profiles: users_results['users'],
            total_pages: users_results['total_num_pages'],
            total_num_records: users_results['total_num_users'],
          }, status: :ok
        elsif params[:profile_type] == 'organization'
          organization_results = ClickHouseQueries::Organizations::List.new(
            current_workspace.id, 
            filter_groups: query_filter_groups, 
            page: (params[:page] || 1).to_i, 
            limit: (params[:limit] || 10).to_i
          ).get
          render json: {
            profiles: organization_results['organizations'],
            total_pages: organization_results['total_num_pages'],
            total_num_records: organization_results['total_num_organizations'],
          }, status: :ok
        else
          render json: { error: "profile_type must be 'user' or 'organization', received: #{params[:profile_type] || 'UNDEFINED'}" }, status: :unprocessable_entity
        end
      end
    end
  end
end