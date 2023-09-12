module Api
  module V1
    class SessionsController < BaseController
      include TimeseriesHelper

      def count
        render json: {
          count: current_workspace.analytics_sessions.starting_after(start_timestamp).starting_at_or_before(end_timestamp).count,
          comparison_count: current_workspace.analytics_sessions.starting_after(comparison_start_timestamp).starting_at_or_before(comparison_end_timestamp).count,
          start_time: start_timestamp,
          end_time: end_timestamp,
          comparison_start_time: comparison_start_timestamp,
          comparison_end_time: comparison_end_timestamp,
        }, status: :ok
      end

      def timeseries
        params[:analytics_family] ||= 'marketing'
        raise 'Invalid analytics_family' unless ['marketing', 'product'].include?(params[:analytics_family])

        timeseries = Analytics::SessionCountByAnalyticsFamilyAndHour.timeseries(
          api_key: current_workspace.public_key, 
          analytics_family: params[:analytics_family], 
          start_time: start_timestamp, 
          end_time: end_timestamp
        )
        comparison_timeseries = Analytics::SessionCountByAnalyticsFamilyAndHour.timeseries(
          api_key: current_workspace.public_key,
          analytics_family: params[:analytics_family],
          start_time: comparison_start_timestamp,
          end_time: comparison_end_timestamp
        )
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

      def referrers
        analytics_family = params[:analytics_family] || 'marketing'
        if !['marketing', 'product'].include?(analytics_family)
          render json: { 
            error: "Invalid `analytics_family` parameter provided: #{analytics_family}. Supported values are 'marketing', or 'product'." 
          }, status: :bad_request
          return
        end
        referrers = Analytics::SessionReferrerCountByAnalyticsFamilyAndHour.list(
          api_key: current_workspace.public_key,
          analytics_family: analytics_family,
          start_time: start_timestamp,
          end_time: end_timestamp,
          limit: params[:limit] || 10
        )
        render json: { referrers: referrers, start_time: start_timestamp, end_time: end_timestamp }, status: :ok
      end

      def demographics
        limit = params[:limit] = 10
        params[:types] = JSON.parse(params[:types] || ['device_type', 'browser', 'city', 'region', 'country'].to_s)
        json = { start_time: start_timestamp, end_time: end_timestamp }
        # hosts_to_filter = current_workspace.url_segments.pluck(:url_host)
        # querier = ClickHouseQueries::Sessions::ByNewSessionPropertyCount.new(current_workspace.public_key, url_hosts: hosts_to_filter, limit: limit, start_time: start_timestamp, end_time: end_timestamp)

        # if params[:types].include?('device_type')
        #   devices = querier.get(:is_mobile)
        #   json[:mobile_count] = devices[1] || 0
        #   json[:desktop_count] = devices[0] || 0
        # end
        if params[:types].include?('browser')
          browsers = Analytics::BrowserCountByAnalyticsFamilyAndHour.list(
            api_key: current_workspace.public_key,
            analytics_family: params[:analytics_family] || 'marketing',
            start_time: start_timestamp,
            end_time: end_timestamp,
            limit: limit
          )
          json[:browsers] = browsers
        end

        # json[:cities] = querier.get(:city) if params[:types].include?('city')
        # json[:regions] = querier.get(:region) if params[:types].include?('region')
        # json[:countries] = querier.get(:country) if params[:types].include?('country')

        render json: json, status: :ok
      end
    end
  end
end