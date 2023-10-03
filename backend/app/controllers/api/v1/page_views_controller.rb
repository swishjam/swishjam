module Api
  module V1
    class PageViewsController < BaseController
      def index
        limit = params[:limit] || 10
        params[:data_source] ||= ApiKey::ReservedDataSources.MARKETING
        page_view_counts = ClickHouseQueries::PageViews::MostVisited::List.new(
          public_keys_for_requested_data_source,
          start_time: start_timestamp,
          end_time: end_timestamp,
          limit: limit
        ).get
        render json: { page_view_counts: page_view_counts, start_time: start_timestamp, end_time: end_timestamp }, status: :ok
      end

      def timeseries
        params[:data_source] ||= ApiKey::ReservedDataSources.MARKETING

        timeseries = ClickHouseQueries::PageViews::Timeseries.new(
          public_keys_for_requested_data_source,
          start_time: start_timestamp,
          end_time: end_timestamp
        ).timeseries
        comparison_timeseries = ClickHouseQueries::PageViews::Timeseries.new(
          public_keys_for_requested_data_source,
          start_time: comparison_start_timestamp,
          end_time: comparison_end_timestamp
        ).timeseries
        json = {
          timeseries: timeseries.formatted_data,
          current_count: timeseries.current_value,
          total_count: timeseries.summed_value,
          comparison_timeseries: comparison_timeseries.formatted_data,
          comparison_count: comparison_timeseries.current_value,
          comparison_total_count: comparison_timeseries.summed_value,
          start_time: start_timestamp,
          end_time: end_timestamp,
          comparison_start_time: comparison_start_timestamp,
          comparison_end_time: comparison_end_timestamp
          # grouped_by: group_by_method.to_s.split('_').last,
        }
        
        render json: json, status: :ok
      end
    end
  end
end
