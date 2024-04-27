module Api
  module V1
    class EventsController < BaseController
      include TimeseriesHelper

      # global events list for workspace
      def index
        params[:data_source] ||= 'all'
        limit = (params[:limit] || 100).to_i
        events = ClickHouseQueries::Events::List.new(
          public_keys_for_requested_data_source,
          start_time: start_timestamp,
          end_time: end_timestamp,
          limit: limit,
          columns: ['uuid'],
          user_profile_id: params[:user_id],
          workspace_id: current_workspace.id,
        ).get
        render json: events, status: :ok
      end

      def unique
        params[:data_source] ||= 'all'
        limit = (params[:limit] || 200).to_i
        events_and_counts = ClickHouseQueries::Events::Unique::List.new(public_keys_for_requested_data_source, limit: limit, start_time: 6.months.ago, end_time: Time.current).get
        render json: events_and_counts, status: :ok
      end

      def timeseries
        params[:data_source] ||= 'all'
        params[:aggregation] ||= 'count'
        event_name = URI.decode_uri_component(params[:name])
        query_groups = JSON.parse(params[:query_groups] || '[]')

        timeseries = ClickHouseQueries::Events::Timeseries.new(
          public_keys_for_requested_data_source, 
          event: event_name, 
          query_groups: query_groups,
          aggregated_column: params[:property],
          aggregation: params[:aggregation],
          start_time: start_timestamp, 
          end_time: end_timestamp
        ).get
        
        comparison_timeseries = nil
        if params[:include_comparison] == 'true'
          comparison_timeseries = ClickHouseQueries::Events::Timeseries.new(
            public_keys_for_requested_data_source, 
            event: event_name, 
            query_groups: query_groups,
            aggregated_column: params[:property],
            aggregation: params[:aggregation],
            start_time: comparison_start_timestamp, 
            end_time: comparison_end_timestamp
          ).get
        end
        render json: render_timeseries_json(timeseries, comparison_timeseries), status: :ok
      end

      def value
        params[:data_source] ||= 'all'
        event_name = URI.decode_uri_component(params[:name])
        aggregated_column = params[:property] ? URI.decode_uri_component(params[:property]) : nil
        query_groups = JSON.parse(params[:query_groups] || '[]')

        value = ClickHouseQueries::Events::Value.new(
          public_keys_for_requested_data_source, 
          event: event_name, 
          aggregation: params[:aggregation],
          aggregated_column: aggregated_column,
          query_groups: query_groups,
          start_time: start_timestamp, 
          end_time: end_timestamp
        ).get
        comparison_value = nil
        if params[:include_comparison] == 'true'
          comparison_value = ClickHouseQueries::Events::Value.new(
            public_keys_for_requested_data_source, 
            event: event_name, 
            aggregation: params[:aggregation],
            aggregated_column: aggregated_column,
            query_groups: query_groups,
            start_time: comparison_start_timestamp, 
            end_time: comparison_end_timestamp
          ).get
        end
        render json: { 
          value: value, 
          comparison_value: comparison_value,
          start_time: start_timestamp,
          end_time: end_timestamp,
          comparison_start_time: comparison_start_timestamp,
          comparison_end_time: comparison_end_timestamp,
        }, status: :ok
      end

      def count
        params[:data_source] ||= 'all'
        event_name = URI.decode_uri_component(params[:name])
        count = ClickHouseQueries::Events::Count::Total.new(public_keys_for_requested_data_source, event: event_name, start_time: start_timestamp, end_time: end_timestamp).get
        comparison_count = ClickHouseQueries::Events::Count::Total.new(public_keys_for_requested_data_source, event: event_name, start_time: comparison_start_timestamp, end_time: comparison_end_timestamp).get
        render json: { 
          count: count, 
          comparison_count: comparison_count,
          start_time: start_timestamp,
          end_time: end_timestamp,
          comparison_start_time: comparison_start_timestamp,
          comparison_end_time: comparison_end_timestamp,
        }, status: :ok
      end

      def show
        params[:data_source] ||= 'all'

        timeseries = ClickHouseQueries::Events::Timeseries.new(
          public_keys_for_requested_data_source, 
          event: params[:name],
          start_time: start_timestamp,
          end_time: end_timestamp
        ).get

        comparison_timeseries = ClickHouseQueries::Events::Timeseries.new(
          public_keys_for_requested_data_source, 
          event: params[:name],
          start_time: comparison_start_timestamp,
          end_time: comparison_end_timestamp
        ).get

        top_attributes = ClickHouseQueries::Event::PropertyCounts.new(public_keys_for_requested_data_source, event_name: params[:name]).get
        top_users = ClickHouseQueries::Event::TopUsers::List.new(public_keys_for_requested_data_source, workspace_id: current_workspace.id, event_name: params[:name]).get

        render json: {
          timeseries: timeseries.formatted_data,
          current_count: timeseries.current_value,
          comparison_timeseries: comparison_timeseries.formatted_data,
          comparison_count: comparison_timeseries.current_value,
          top_users: top_users,
          top_attributes: top_attributes,
          start_time: timeseries.start_time,
          end_time: timeseries.end_time,
          grouped_by: timeseries.group_by,
        }, status: :ok
      end
    end
  end
end