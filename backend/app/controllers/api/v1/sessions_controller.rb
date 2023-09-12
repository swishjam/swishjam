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

        timeseries = ClickHouseQueries::Sessions::Timeseries.new(
          current_workspace.public_key,
          analytics_family: params[:analytics_family],
          start_time: start_timestamp,
          end_time: end_timestamp
        ).timeseries
        comparison_timeseries = ClickHouseQueries::Sessions::Timeseries.new(
          current_workspace.public_key,
          analytics_family: params[:analytics_family],
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

      def referrers
        analytics_family = params[:analytics_family] || 'marketing'
        if !['marketing', 'product'].include?(analytics_family)
          render json: { 
            error: "Invalid `analytics_family` parameter provided: #{analytics_family}. Supported values are 'marketing', or 'product'." 
          }, status: :bad_request
          return
        end

        params[:by_referrer_host] = params[:by_referrer_host].present?
        querier = ClickHouseQueries::Sessions::Referrers::List.new(
          current_workspace.public_key,
          analytics_family: analytics_family,
          start_time: start_timestamp,
          end_time: end_timestamp,
          limit: params[:limit] || 10
        )
        referrers = params[:by_referrer_host] ? querier.by_host : querier.by_full_url
        render json: { referrers: referrers, start_time: start_timestamp, end_time: end_timestamp }, status: :ok
      end

      def demographics
        limit = params[:limit] = 10
        analytics_family = params[:analytics_family] || 'marketing'
        params[:types] = JSON.parse(params[:types] || ['device_type', 'browser', 'city', 'region', 'country'].to_s)
        json = { start_time: start_timestamp, end_time: end_timestamp }

        if params[:types].include?('device_type')
          devices = ClickHouseQueries::Sessions::DeviceTypes::List.new(
            current_workspace.public_key,
            analytics_family: analytics_family,
            start_time: start_timestamp,
            end_time: end_timestamp,
          ).get
          json[:mobile_count] = devices.find{ |event| event.device_type == 'mobile' }&.count || 0
          json[:desktop_count] = devices.find{ |event| event.device_type == 'desktop' }&.count || 0
        end
        if params[:types].include?('browser')
          json[:browsers] = ClickHouseQueries::Sessions::Browsers::List.new(
            current_workspace.public_key,
            analytics_family: analytics_family,
            start_time: start_timestamp,
            end_time: end_timestamp,
            limit: params[:limit] || 10
          ).get
        end

        # json[:cities] = querier.get(:city) if params[:types].include?('city')
        # json[:regions] = querier.get(:region) if params[:types].include?('region')
        # json[:countries] = querier.get(:country) if params[:types].include?('country')

        render json: json, status: :ok
      end
    end
  end
end