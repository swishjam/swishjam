module Api
  module V1
    class EventsController < BaseController
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
        top_users = ClickHouseQueries::Event::TopUsers.new(public_keys_for_requested_data_source, event_name: params[:name]).get

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

      def unique
        params[:data_source] ||= 'all'
        events = ClickHouseQueries::Events::Unique.new(public_keys_for_requested_data_source, limit: params[:limit] || 25).get
        render json: events, status: :ok
      end
    end
  end
end