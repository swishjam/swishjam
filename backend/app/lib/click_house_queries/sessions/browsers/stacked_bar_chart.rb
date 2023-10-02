module ClickHouseQueries
  module Sessions
    module Browsers
      class StackedBarChart
        include ClickHouseQueries::Helpers
        include TimeseriesHelper

        def initialize(public_keys, start_time: 6.months.ago, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
          @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        end

        def data
          @data ||= ClickHouseQueries::Common::StackedBarChartByEventProperty.new(
            @public_keys,
            event_name: Analytics::Event::ReservedNames.NEW_SESSION,
            property: 'browser_name',
            start_time: @start_time,
            end_time: @end_time,
          ).data
        end
      end
    end
  end
end