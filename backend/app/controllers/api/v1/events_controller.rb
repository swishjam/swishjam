module Api
  module V1
    class EventsController < BaseController
      include TimeseriesHelper

      def unique
        params[:data_source] ||= 'all'
        limit = params[:limit] || 50
        events = ClickHouseQueries::Events::Unique::List.new(public_keys_for_requested_data_source, limit: limit, start_time: 6.months.ago, end_time: Time.current).get
        render json: events, status: :ok
      end

      def timeseries
        params[:data_source] ||= 'all'
        params[:calculation] ||= 'count'
        event_name = URI.decode_uri_component(params[:name])

        timeseries = nil
        comparison_timeseries = nil

        case params[:calculation]
        when 'count'
          timeseries = ClickHouseQueries::Events::Count::Timeseries.new(
            public_keys_for_requested_data_source, 
            event_name: event_name, 
            start_time: start_timestamp, 
            end_time: end_timestamp
          ).get
          
          if params[:include_comparison]
            comparison_timeseries = ClickHouseQueries::Events::Count::Timeseries.new(
              public_keys_for_requested_data_source, 
              event_name: event_name, 
              start_time: comparison_start_timestamp, 
              end_time: comparison_end_timestamp
            ).get
          end
        when 'sum'
          if !params[:property]
            render json: { error: "Property must be provided for sum calculation" }, status: :bad_request
            return
          end
          timeseries = ClickHouseQueries::Events::Sum::Timeseries.new(
            public_keys_for_requested_data_source, 
            event_name: event_name, 
            property: params[:property],
            start_time: start_timestamp, 
            end_time: end_timestamp
          ).get
          
          if params[:include_comparison]
            comparison_timeseries = ClickHouseQueries::Events::Sum::Timeseries.new(
              public_keys_for_requested_data_source, 
              event_name: event_name, 
              property: params[:property],
              start_time: comparison_start_timestamp, 
              end_time: comparison_end_timestamp
            ).get
          end
        when 'average', 'avg'
          if !params[:property]
            render json: { error: "Property must be provided for average calculation" }, status: :bad_request
            return
          end
          timeseries = ClickHouseQueries::Events::Average::Timeseries.new(
            public_keys_for_requested_data_source,
            event_name: event_name,
            property: params[:property],
            start_time: start_timestamp,
            end_time: end_timestamp
          ).get

          if params[:include_comparison]
            comparison_timeseries = ClickHouseQueries::Events::Average::Timeseries.new(
              public_keys_for_requested_data_source,
              event_name: event_name,
              property: params[:property],
              start_time: comparison_start_timestamp,
              end_time: comparison_end_timestamp
            ).get
          end
        when 'maximum', 'max'
          if !params[:property]
            render json: { error: "Property must be provided for maximum calculation" }, status: :bad_request
            return
          end
          timeseries = ClickHouseQueries::Events::Maximum::Timeseries.new(
            public_keys_for_requested_data_source,
            event_name: event_name,
            property: params[:property],
            start_time: start_timestamp,
            end_time: end_timestamp
          ).get

          if params[:include_comparison]
            comparison_timeseries = ClickHouseQueries::Events::Maximum::Timeseries.new(
              public_keys_for_requested_data_source,
              event_name: event_name,
              property: params[:property],
              start_time: comparison_start_timestamp,
              end_time: comparison_end_timestamp
            ).get
          end
        when 'minimum', 'min'
          if !params[:property]
            render json: { error: "Property must be provided for minimum calculation" }, status: :bad_request
            return
          end
          timeseries = ClickHouseQueries::Events::Minimum::Timeseries.new(
            public_keys_for_requested_data_source,
            event_name: event_name,
            property: params[:property],
            start_time: start_timestamp,
            end_time: end_timestamp
          ).get

          if params[:include_comparison]
            comparison_timeseries = ClickHouseQueries::Events::Minimum::Timeseries.new(
              public_keys_for_requested_data_source,
              event_name: event_name,
              property: params[:property],
              start_time: comparison_start_timestamp,
              end_time: comparison_end_timestamp
            ).get
          end
        else
          render json: { error: "Invalid calculation provided: #{params[:calculation]}" }, status: :bad_request
          return
        end

        render json: render_timeseries_json(timeseries, comparison_timeseries), status: :ok
      end

      def count
        params[:data_source] ||= 'all'
        event_name = URI.decode_uri_component(params[:name])
        count = ClickHouseQueries::Events::Count::Total.new(public_keys_for_requested_data_source, event_name: event_name, start_time: start_timestamp, end_time: end_timestamp).get
        comparison_count = ClickHouseQueries::Events::Count::Total.new(public_keys_for_requested_data_source, event_name: event_name, start_time: comparison_start_timestamp, end_time: comparison_end_timestamp).get
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

        timeseries = ClickHouseQueries::Event::Timeseries.new(
          public_keys_for_requested_data_source, 
          event_name: params[:name],
          start_time: start_timestamp,
          end_time: end_timestamp
        ).timeseries

        comparison_timeseries = ClickHouseQueries::Event::Timeseries.new(
          public_keys_for_requested_data_source, 
          event_name: params[:name],
          start_time: comparison_start_timestamp,
          end_time: comparison_end_timestamp
        ).timeseries

        top_attributes = ClickHouseQueries::Event::PropertyCounts.new(public_keys_for_requested_data_source, event_name: params[:name]).get
        top_users = ClickHouseQueries::Event::TopUsers::List.new(public_keys_for_requested_data_source, event_name: params[:name]).get

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