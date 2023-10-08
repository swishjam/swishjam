module Api
  module V1
    class EventsController < BaseController
      def unique
        params[:data_source] ||= 'all'
        limit = params[:limit] || 50
        events = ClickHouseQueries::Events::Unique::List.new(public_keys_for_requested_data_source, limit: limit, start_time: 6.months.ago, end_time: Time.current).get
        render json: events, status: :ok
      end

      def timeseries
        params[:data_source] ||= 'all'
        event_name = URI.decode_uri_component(params[:name])
        timeseries = ClickHouseQueries::Events::Count::Timeseries.new(public_keys_for_requested_data_source, event_name: event_name, start_time: start_timestamp, end_time: end_timestamp).get
        render json: timeseries.formatted_data, status: :ok
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