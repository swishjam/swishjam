module Api
  module V1
    module Admin
      class IngestionController < BaseController
        def queueing
          diagnostics = ClickHouseQueries::Events::Diagnostics.new(start_time: 7.day.ago, end_time: Time.current, group_by: :minute).timeseries
          formatted_timeseries = diagnostics.map{ |e| { date: e.timeperiod, value: e.average_ingestion_time }}
          render json: formatted_timeseries, status: :ok
        end
      end
    end
  end
end