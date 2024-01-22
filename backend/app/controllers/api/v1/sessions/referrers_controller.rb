module Api
  module V1
    module Sessions
      class ReferrersController < BaseController
        def bar_chart
          params[:data_source] ||= ApiKey::ReservedDataSources.MARKETING
          chart_data = ClickHouseQueries::Events::StackedBarChart.new(
            public_keys_for_requested_data_source,
            event: Analytics::Event::ReservedNames.NEW_SESSION,
            property: Analytics::Event::ReservedPropertyNames.REFERRER,
            start_time: start_timestamp,
            end_time: end_timestamp,
            exclude_empty_property_values: false, # an empty referrer is a direct visit
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