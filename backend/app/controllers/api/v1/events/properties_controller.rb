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

        def sum
          params[:data_source] ||= 'all'
          event_name = URI.decode_uri_component(params[:event_name])
          property_name = URI.decode_uri_component(params[:name])
          sum = ClickHouseQueries::Events::Properties::Sum.new(
            public_keys_for_requested_data_source, 
            event_name: event_name, 
            property_name: property_name,
            start_time: start_time, 
            end_time: end_time
          ).get

          comparison_sum = nil
          if params[:include_comparison]
            comparison_sum = ClickHouseQueries::Events::Properties::Sum.new(
              public_keys_for_requested_data_source,
              event_name: event_name,
              property_name: property_name,
              start_time: comparison_start_time,
              end_time: comparison_end_time
            ).get
          end
          render json: { 
            sum: sum, 
            comparison_sum: comparison_sum,
            start_time: start_time,
            end_time: end_time,
            comparison_start_time: comparison_start_time,
            comparison_end_time: comparison_end_time,
          }, status: :ok
        end

        def average
          params[:data_source] ||= 'all'
          event_name = URI.decode_uri_component(params[:event_name])
          property_name = URI.decode_uri_component(params[:name])
          average = ClickHouseQueries::Events::Properties::Average.new(
            public_keys_for_requested_data_source, 
            event_name: event_name, 
            property_name: property_name,
            start_time: start_time, 
            end_time: end_time
          ).get

          comparison_average = nil
          if params[:include_comparison]
            comparison_average = ClickHouseQueries::Events::Properties::Average.new(
              public_keys_for_requested_data_source,
              event_name: event_name,
              property_name: property_name,
              start_time: comparison_start_time,
              end_time: comparison_end_time
            ).get
          end
          render json: { 
            average: average, 
            comparison_average: comparison_average,
            start_time: start_time,
            end_time: end_time,
            comparison_start_time: comparison_start_time,
            comparison_end_time: comparison_end_time,
          }, status: :ok
        end

        def minimum
          params[:data_source] ||= 'all'
          event_name = URI.decode_uri_component(params[:event_name])
          property_name = URI.decode_uri_component(params[:name])
          minimum = ClickHouseQueries::Events::Properties::Minimum.new(
            public_keys_for_requested_data_source, 
            event_name: event_name, 
            property_name: property_name,
            start_time: start_time, 
            end_time: end_time
          ).get

          comparison_minimum = nil
          if params[:include_comparison]
            comparison_minimum = ClickHouseQueries::Events::Properties::Minimum.new(
              public_keys_for_requested_data_source,
              event_name: event_name,
              property_name: property_name,
              start_time: comparison_start_time,
              end_time: comparison_end_time
            ).get
          end
          render json: { 
            minimum: minimum, 
            comparison_minimum: comparison_minimum,
            start_time: start_time,
            end_time: end_time,
            comparison_start_time: comparison_start_time,
            comparison_end_time: comparison_end_time,
          }, status: :ok
        end

        def maximum
          params[:data_source] ||= 'all'
          event_name = URI.decode_uri_component(params[:event_name])
          property_name = URI.decode_uri_component(params[:name])
          maximum = ClickHouseQueries::Events::Properties::Maximum.new(
            public_keys_for_requested_data_source, 
            event_name: event_name, 
            property_name: property_name,
            start_time: start_time, 
            end_time: end_time
          ).get

          comparison_maximum = nil
          if params[:include_comparison]
            comparison_maximum = ClickHouseQueries::Events::Properties::Maximum.new(
              public_keys_for_requested_data_source,
              event_name: event_name,
              property_name: property_name,
              start_time: comparison_start_time,
              end_time: comparison_end_time
            ).get
          end
          render json: {
            maximum: maximum,
            comparison_maximum: comparison_maximum,
            start_time: start_time,
            end_time: end_time,
            comparison_start_time: comparison_start_time,
            comparison_end_time: comparison_end_time,
          }, status: :ok
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
          query_groups = JSON.parse(params[:query_groups] || '[]')
          bar_chart_results = ClickHouseQueries::Events::StackedBarChart.new(
            public_keys_for_requested_data_source,
            event: event_name,
            property: property,
            query_groups: query_groups,
            start_time: start_timestamp,
            end_time: end_timestamp,
            max_ranking_to_not_be_considered_other: params[:max_ranking_to_not_be_considered_other] || 10,
          ).get

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