module Api
  module V1
    class SessionsController < BaseController
      include TimeseriesHelper

      def count
        raise "Deprecated"
      end

      def timeseries
        params[:data_source] ||= ApiKey::ReservedDataSources.MARKETING

        timeseries = ClickHouseQueries::Sessions::Timeseries.new(
          public_keys_for_requested_data_source,
          start_time: start_timestamp,
          end_time: end_timestamp
        ).timeseries
        comparison_timeseries = ClickHouseQueries::Sessions::Timeseries.new(
          public_keys_for_requested_data_source,
          start_time: comparison_start_timestamp,
          end_time: comparison_end_timestamp
        ).timeseries

        render json: {
          timeseries: timeseries.formatted_data,
          current_count: timeseries.current_value,
          total_count: timeseries.summed_value,
          comparison_timeseries: comparison_timeseries.formatted_data,
          comparison_count: comparison_timeseries.current_value,
          comparison_total_count: comparison_timeseries.summed_value,
          start_time: start_timestamp,
          end_time: end_timestamp,
          comparison_start_time: comparison_start_timestamp,
          comparison_end_time: comparison_end_timestamp,
          grouped_by: timeseries.group_by,
        } , status: :ok
      end

      def referrers
        params[:data_source] ||= ApiKey::ReservedDataSources.MARKETING

        params[:by_referrer_host] = params[:by_referrer_host].present?
        querier = ClickHouseQueries::Sessions::Referrers::List.new(
          public_keys_for_requested_data_source,
          start_time: start_timestamp,
          end_time: end_timestamp,
          limit: params[:limit] || 10
        )
        referrers = params[:by_referrer_host] ? querier.by_host : querier.by_full_url
        render json: { referrers: referrers, start_time: start_timestamp, end_time: end_timestamp }, status: :ok
      end

      def demographics
        limit = params[:limit] = 10
        params[:data_source] ||= ApiKey::ReservedDataSources.MARKETING
        params[:types] = JSON.parse(params[:types] || ['device_type', 'browser', 'city', 'region', 'country'].to_s)
        json = { start_time: start_timestamp, end_time: end_timestamp }

        if params[:types].include?('device_type')
          json[:device_types] = ClickHouseQueries::Sessions::DeviceTypes::List.new(
            public_keys_for_requested_data_source,
            start_time: start_timestamp,
            end_time: end_timestamp,
          ).get
        end
        if params[:types].include?('browser')
          json[:browsers] = ClickHouseQueries::Sessions::Browsers::List.new(
            public_keys_for_requested_data_source,
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