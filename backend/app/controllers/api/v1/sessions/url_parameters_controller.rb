module Api
  module V1
    module Sessions
      class UrlParametersController < BaseController
        def bar_chart
          params[:data_source] ||= ApiKey::ReservedDataSources.MARKETING
          if params[:query_param]
            bar_chart_data = ClickHouseQueries::Sessions::UrlParameters::StackedBarChart.new(
              public_keys_for_requested_data_source, 
              query_param: params[:query_param], 
              start_time: params[:start_time], 
              end_time: params[:end_time],
            ).get
            render json: {
              data: bar_chart_data.filled_in_data,
              start_time: bar_chart_data.start_time,
              end_time: bar_chart_data.end_time,
              data_source: params[:data_source]
            }
          elsif params[:query_params]
            json = Hash.new.tap do |hash|
              params[:query_params].split(',').each do |query_param|
                bar_chart_data = ClickHouseQueries::Sessions::UrlParameters::StackedBarChart.new(
                  public_keys_for_requested_data_source,
                  query_param: query_param.strip,
                  start_time: start_timestamp,
                  end_time: end_timestamp,
                ).get
                hash[query_param] = bar_chart_data.filled_in_data
              end
            end
            render json: json, status: :ok
          else
            render json: { error: 'Must provide `query_param` or `query_params`' }, status: :unprocessable_entity
          end
        end
      end
    end
  end
end