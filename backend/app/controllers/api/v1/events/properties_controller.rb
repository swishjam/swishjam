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
      end
    end
  end
end