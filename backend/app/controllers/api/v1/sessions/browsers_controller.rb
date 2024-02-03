module Api
  module V1
    module Sessions
      class BrowsersController < BaseController
        def bar_chart
          params[:data_source] ||= ApiKey::ReservedDataSources.MARKETING
          # instrumentation doesn't send browser details on page view events, only new_session :/
          # chart_data = ClickHouseQueries::Events::StackedBarChart.new(
          #   public_keys_for_requested_data_source,
          #   event: Analytics::Event::ReservedNames.PAGE_VIEW,
          #   property: 'browser_name',
          #   count_distinct_property: Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER,
          #   start_time: start_timestamp,
          #   end_time: end_timestamp,
          # )
          chart_data = ClickHouseQueries::Events::StackedBarChart.new(
            public_keys_for_requested_data_source,
            event: Analytics::Event::ReservedNames.NEW_SESSION,
            property: 'browser_name',
            count_distinct_property: Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER,
            start_time: start_timestamp,
            end_time: end_timestamp,
          ).get
          render json: {
            data: chart_data.filled_in_data,
            start_time: chart_data.start_time,
            end_time: chart_data.end_time,
            data_source: params[:data_source]
          }
        end
      end
    end
  end
end