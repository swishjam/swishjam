module Api
  module V1
    class DataVizController < BaseController
      include TimeseriesHelper

      def timeseries
        params[:data_source] ||= 'all'
        params[:aggregation_method] ||= 'count'
        if event.blank?
          render json: { error: '`event` param is required' }, status: :bad_request
          return
        end

        timeseries = ClickHouseQueries::Events::Timeseries.new(
          public_keys_for_requested_data_source, 
          event: event, 
          query_groups: query_groups,
          aggregated_column: property,
          aggregation_method: aggregation_method,
          start_time: start_timestamp, 
          end_time: end_timestamp
        ).get
        
        comparison_timeseries = nil
        if params[:include_comparison] == 'true'
          comparison_timeseries = ClickHouseQueries::Events::Timeseries.new(
            public_keys_for_requested_data_source, 
            event: event, 
            query_groups: query_groups,
            aggregated_column: property,
            aggregation_method: aggregation_method,
            start_time: comparison_start_timestamp, 
            end_time: comparison_end_timestamp
          ).get
        end
        render json: render_timeseries_json(timeseries, comparison_timeseries), status: :ok
      end
      
      def stacked_bar_chart
        params[:data_source] ||= 'all'
        if event.blank? || property.blank?
          render json: { error: '`event` and `property` params are required' }, status: :bad_request
          return
        end
        bar_chart_results = ClickHouseQueries::Events::StackedBarChart.new(
          public_keys_for_requested_data_source,
          event: event,
          property: property,
          aggregation_method: aggregation_method,
          query_groups: query_groups,
          start_time: start_timestamp,
          end_time: end_timestamp,
          max_ranking_to_not_be_considered_other: (params[:max_ranking_to_not_be_considered_other] || 10).to_i,
          exclude_empty_values: params[:exclude_empty_values] == 'true',
          empty_value_placeholder: params[:empty_value_placeholder]
        ).get

        render json: {
          start_time: bar_chart_results.start_time,
          end_time: bar_chart_results.end_time,
          grouped_by: bar_chart_results.group_by,
          bar_chart_data: bar_chart_results.filled_in_data,
        }, status: :ok
      end

      def value
        params[:data_source] ||= 'all'
        if event.blank?
          render json: { error: '`event` param is required' }, status: :bad_request
          return
        end
        value = ClickHouseQueries::Events::Value.new(
          public_keys_for_requested_data_source, 
          event: event, 
          aggregation_method: aggregation_method,
          aggregated_column: property,
          query_groups: query_groups,
          start_time: start_timestamp, 
          end_time: end_timestamp
        ).get
        comparison_value = nil
        if params[:include_comparison] == 'true'
          comparison_value = ClickHouseQueries::Events::Value.new(
            public_keys_for_requested_data_source, 
            event: event, 
            aggregation_method: aggregation_method,
            aggregated_column: property,
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

      def pie_chart
      end

      private

      def event
        (params[:event] || params[:event_name]) ? URI.decode_uri_component(params[:event] || params[:event_name]) : nil
      end

      def property
        (params[:property] || params[:property_name]) ? URI.decode_uri_component(params[:property] || params[:property_name]) : nil
      end

      def query_groups
        JSON.parse(params[:query_groups] || '[]')
      end

      def aggregation_method
        params[:aggregation_method]
      end
    end
  end
end