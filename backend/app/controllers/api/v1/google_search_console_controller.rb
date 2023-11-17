module Api
  module V1
    class GoogleSearchConsoleController < BaseController
      def analytics
        integration = current_workspace.integrations.find_by(type: Integrations::GoogleSearchConsole.to_s)
        if !integration
          render json: { error: 'Please connect the Google Search Console data source under the `data sources` navigation item in order to view search data.' }, status: :unprocessable_entity and return
          return
        end
        
        current_timeseries_data = GoogleApis::Search.new(integration).get_analytics(
          params[:site_url],
          start_date: start_timestamp,
          end_date: end_timestamp,
        )

        comparison_timeseries_data = nil
        if params[:include_comparison] != 'true'
          comparison_timeseries_data = GoogleApis::Search.new(integration).get_analytics(
            params[:site_url], 
            start_date: comparison_start_timestamp,
            end_date: comparison_end_timestamp,
          )
        end

        query_data = GoogleApis::Search.new(integration).get_analytics(
          params[:site_url],
          start_date: start_timestamp,
          end_date: end_timestamp,
          dimensions: ['query'],
          row_limit: 20,
        )
        
        render json: {
          query_data: query_data,
          timeseries: current_timeseries_data,
          comparison_timeseries: comparison_timeseries_data,
          start_time: start_timestamp,
          end_time: end_timestamp,
          comparison_start_time: comparison_start_timestamp,
          comparison_end_time: comparison_end_timestamp,
        }, status: :ok
      rescue GoogleApis::Search::RequestError => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      def sites
        integration = current_workspace.integrations.find_by(type: Integrations::GoogleSearchConsole.to_s)
        if !integration
          render json: { error: 'Please connect the Google Search Console data source under the `data sources` navigation item in order to view search data.' }, status: :unprocessable_entity and return
          return
        end
        render json: GoogleApis::Search.new(integration).get_sites, status: :ok
      rescue GoogleApis::Search::RequestError => e
        render json: { error: e.message }, status: :unprocessable_entity
      end
    end
  end
end