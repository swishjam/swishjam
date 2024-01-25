module Api
  module V1
    class SessionsController < BaseController
      include TimeseriesHelper

      def count
        raise NotImplementedError, "This endpoint is deprecated"
      end

      def timeseries
        params[:data_source] ||= ApiKey::ReservedDataSources.MARKETING

        timeseries = ClickHouseQueries::Events::Timeseries.new(
          public_keys_for_requested_data_source,
          event: Analytics::Event::ReservedNames.PAGE_VIEW,
          distinct_count_property: Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER,
          start_time: start_timestamp,
          end_time: end_timestamp,
        ).get

        comparison_timeseries = ClickHouseQueries::Events::Timeseries.new(
          public_keys_for_requested_data_source,
          event: Analytics::Event::ReservedNames.PAGE_VIEW,
          distinct_count_property: Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER,
          start_time: comparison_start_timestamp,
          end_time: comparison_end_timestamp,
        ).get

        render json: {
          timeseries: timeseries.formatted_data,
          current_count: timeseries.current_value,
          total_count: timeseries.summed_value,
          comparison_timeseries: comparison_timeseries.formatted_data,
          comparison_count: comparison_timeseries.current_value,
          comparison_total_count: comparison_timeseries.summed_value,
          start_time: start_timestamp,
          end_time: end_timestamp,
          comparison_start_time: comparison_start_timestamp,
          comparison_end_time: comparison_end_timestamp,
          grouped_by: timeseries.group_by,
        }, status: :ok
      end

      def referrers
        raise NotImplementedError, "This endpoint is deprecated"
      end

      def demographics
        raise NotImplementedError, "This endpoint is deprecated"
      end
    end
  end
end