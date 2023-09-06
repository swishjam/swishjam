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
        hosts_to_filter = current_workspace.url_segments.pluck(:url_host)
        current_timeseries_querier = ClickHouseQueries::Sessions::Timeseries.new(
          current_workspace.public_key, 
          url_hosts: hosts_to_filter, 
          start_time: start_timestamp, 
          end_time: end_timestamp
        )
        comparison_timeseries_querier = ClickHouseQueries::Sessions::Timeseries.new(
          current_workspace.public_key, 
          url_hosts: hosts_to_filter, 
          start_time: comparison_start_timestamp, 
          end_time: comparison_end_timestamp
        )
        json = {
          timeseries: current_timeseries_querier.timeseries,
          current_count: current_timeseries_querier.current_value,
          comparison_timeseries: comparison_timeseries_querier.timeseries,
          comparison_count: comparison_timeseries_querier.most_recent_value,
          start_time: start_timestamp,
          end_time: end_timestamp,
          comparison_start_time: comparison_start_timestamp,
          comparison_end_time: comparison_end_timestamp,
          url_segments: hosts_to_filter,
          # grouped_by: group_by_method.to_s.split('_').last,
        }
        
        json[:total_count] = json[:timeseries].collect{ |h| h[:value] }.sum
        json[:comparison_total_count] = json[:comparison_timeseries].collect{ |h| h[:value] }.sum

        render json: json, status: :ok
      end

      def referrers
        params[:aggregate_by_host] = params[:aggregate_by_host].nil? ? false : params[:aggregate_by_host]
        hosts_to_filter = current_workspace.url_segments.pluck(:url_host)
        querier = ClickHouseQueries::Sessions::Referrers.new(current_workspace.public_key, url_hosts: hosts_to_filter, limit: params[:limit] || 10, start_time: start_timestamp, end_time: end_timestamp)
        render json: {
          referrers: params[:aggregate_by_host] ? querier.by_host : querier.by_full_url,
          url_segments: hosts_to_filter,
          start_time: start_timestamp,
          end_time: end_timestamp,
        }, status: :ok
      end

      def demographics
        limit = params[:limit] = 10
        params[:types] = JSON.parse(params[:types] || ['device_type', 'browser', 'city', 'region', 'country'].to_s)
        json = { start_time: start_timestamp, end_time: end_timestamp }
        hosts_to_filter = current_workspace.url_segments.pluck(:url_host)
        querier = ClickHouseQueries::Sessions::ByNewSessionPropertyCount.new(current_workspace.public_key, url_hosts: hosts_to_filter, limit: limit, start_time: start_timestamp, end_time: end_timestamp)

        if params[:types].include?('device_type')
          devices = querier.get(:is_mobile)
          json[:mobile_count] = devices[1] || 0
          json[:desktop_count] = devices[0] || 0
        end
        json[:browsers] = querier.get(:browser) if params[:types].include?('browser')
        # json[:cities] = querier.get(:city) if params[:types].include?('city')
        # json[:regions] = querier.get(:region) if params[:types].include?('region')
        # json[:countries] = querier.get(:country) if params[:types].include?('country')

        render json: json, status: :ok
      end
    end
  end
end