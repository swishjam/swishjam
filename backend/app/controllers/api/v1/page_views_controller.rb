module Api
  module V1
    class PageViewsController < BaseController
      include TimeseriesHelper

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

      def bar_chart
        params[:data_source] ||= ApiKey::ReservedDataSources.MARKETING
        chart_data = ClickHouseQueries::Events::StackedBarChart.new(
          public_keys_for_requested_data_source,
          event: Analytics::Event::ReservedNames.PAGE_VIEW,
          property: Analytics::Event::ReservedPropertyNames.URL,
          start_time: start_timestamp,
          end_time: end_timestamp,
          select_function_formatter: 'path',
          property_alias: 'url_path',
          max_ranking_to_not_be_considered_other: params[:max_ranking_to_not_be_considered_other] || 10
        ).get
        render json: {
          data: chart_data.filled_in_data,
          start_time: chart_data.start_time,
          end_time: chart_data.end_time,
          data_source: params[:data_source]
        }
      end

      def timeseries
        params[:data_source] ||= ApiKey::ReservedDataSources.MARKETING

        timeseries = ClickHouseQueries::Events::Timeseries.new(
          public_keys_for_requested_data_source,
          event: Analytics::Event::ReservedNames.PAGE_VIEW,
          distinct_count_property: Analytics::Event::ReservedPropertyNames.PAGE_VIEW_IDENTIFIER,
          start_time: start_timestamp,
          end_time: end_timestamp,
        ).get

        comparison_timeseries = ClickHouseQueries::Events::Timeseries.new(
          public_keys_for_requested_data_source,
          event: Analytics::Event::ReservedNames.PAGE_VIEW,
          distinct_count_property: Analytics::Event::ReservedPropertyNames.PAGE_VIEW_IDENTIFIER,
          start_time: comparison_start_timestamp,
          end_time: comparison_end_timestamp
        ).get

        render json: render_timeseries_json(timeseries, comparison_timeseries), status: :ok
      end
    end
  end
end
