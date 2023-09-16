module Api
  module V1
    module Events
      class PropertiesController < BaseController
        def index
          event_name = URI.decode_uri_component(params[:event_name])
          limit = params[:limit] || 1_000
          properties = ClickHouseQueries::Events::Properties::Unique.new(current_workspace.public_key, event_name: event_name, limit: limit, start_time: 6.months.ago, end_time: Time.current).get
          render json: properties, status: :ok
        end

        def counts
          event_name = URI.decode_uri_component(params[:event_name])
          property_name = URI.decode_uri_component(params[:name])
          limit = params[:limit] || 10
          properties_breakdown = ClickHouseQueries::Events::Properties::Counts.new(
            current_workspace.public_key, 
            event_name: event_name, 
            property_name: property_name,
            start_time: 6.months.ago, 
            end_time: Time.current,
            limit: limit
          ).get
          render json: properties_breakdown, status: :ok
        end
      end
    end
  end
end