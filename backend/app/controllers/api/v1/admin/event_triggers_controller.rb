module Api
  module V1
    module Admin
      class EventTriggersController < BaseController
        def delay_time_timeseries
          timeseries = TriggeredEventTrigger.where('seconds_from_occurred_at_to_triggered > 0')
                                              .group_by_minute(:created_at, time_zone: 'UTC', n: 15, range: 7.days.ago..Time.current, series: false)
                                              .average(:seconds_from_occurred_at_to_triggered)
          render json: timeseries, status: :ok
        end
      end
    end
  end
end