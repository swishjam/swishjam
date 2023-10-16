module Api
  module V1
    module Events
      class PropertiesController < BaseController
        def index
          params[:data_source] ||= 'all'
          limit = params[:limit] || 1_000
          event_name = URI.decode_uri_component(params[:event_name])
          properties = ClickHouseQueries::Events::Properties::Unique.new(public_keys_for_requested_data_source, event_name: event_name, limit: limit, start_time: start_time, end_time: end_time).get
          render json: properties, status: :ok
        end

        def counts
          params[:data_source] ||= 'all'
          limit = params[:limit] || 10
          event_name = URI.decode_uri_component(params[:event_name])
          property_name = URI.decode_uri_component(params[:name])
          properties_breakdown = ClickHouseQueries::Events::Properties::Counts.new(
            public_keys_for_requested_data_source, 
            event_name: event_name, 
            property_name: property_name,
            start_time: start_time, 
            end_time: end_time,
            limit: limit
          ).get
          render json: properties_breakdown, status: :ok
        end

        def stacked_bar_chart
          params[:data_source] ||= 'all'
          event_name = URI.decode_uri_component(params[:event_name])
          property = URI.decode_uri_component(params[:name])
          bar_chart_results = ClickHouseQueries::Common::StackedBarChartByEventProperty.new(
            public_keys_for_requested_data_source,
            event_name: event_name,
            property: property,
            max_ranking_to_not_be_considered_other: params[:max_ranking_to_not_be_considered_other] || 10,
            start_time: start_timestamp,
            end_time: end_timestamp,
          ).data

          render json: {
            start_time: bar_chart_results.start_time,
            end_time: bar_chart_results.end_time,
            grouped_by: bar_chart_results.group_by,
            bar_chart_data: bar_chart_results.filled_in_data,
          }, status: :ok
        end
      end
    end
  end
end