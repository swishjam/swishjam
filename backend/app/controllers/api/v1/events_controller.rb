module Api
  module V1
    class EventsController < BaseController
      def unique
        limit = params[:limit] || 50
        events = ClickHouseQueries::Events::Unique::List.new(current_workspace.public_key, limit: limit, start_time: 6.months.ago, end_time: Time.current).get
        render json: events, status: :ok
      end

      def unique_properties
        event_name = URI.decode_uri_component(params[:name])
        limit = params[:limit] || 1_000
        properties = ClickHouseQueries::Events::Properties::Unique.new(current_workspace.public_key, event_name: event_name, limit: limit, start_time: 6.months.ago, end_time: Time.current).get
        render json: properties, status: :ok
      end

      def timeseries
        event_name = URI.decode_uri_component(params[:name])
        timeseries = ClickHouseQueries::Events::Timeseries.new(current_workspace.public_key, event_name: event_name, start_time: 1.months.ago, end_time: Time.current).get
        render json: timeseries.formatted_data, status: :ok
      end

      def feed
        raise "Not implemented"
        # limit = params[:limit] || 50
        # # TODO: do we need metadata here?
        # events = Analytics::Event.for_instance(current_workspace)
        #                           .joins(device: :user)
        #                           .select('events.id, events.name, events.timestamp, users.email as user_email, users.first_name as user_first_name, users.last_name as user_last_name')
        #                           .order(timestamp: :desc)
        #                           .limit(limit)
        # render json: { events: events }
      end
    end
  end
end