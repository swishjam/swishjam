module Api
  module V1
    module Sessions
      class ReferrersController < BaseController
        def bar_chart
          params[:data_source] ||= ApiKey::ReservedDataSources.MARKETING
          chart_data = ClickHouseQueries::Sessions::Referrers::StackedBarChart.new(
            public_keys_for_requested_data_source,
            start_time: start_timestamp,
            end_time: end_timestamp
          ).data
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