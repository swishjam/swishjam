module ClickHouseQueries
  module Events
    class Diagnostics
      include ClickHouseQueries::Helpers

      def initialize(start_time: 1.day.ago, end_time: Time.current, group_by: :minute)
        @start_time = start_time
        @end_time = end_time
        @group_by = group_by
      end

      def timeseries
        @data ||= Analytics::Event.find_by_sql(sql.squish!)

        # not using DataFormatters, too slow for larger timeframes?
        # @data = DataFormatters::Timeseries.new(
        #   events, 
        #   start_time: @start_time, 
        #   end_time: @end_time, 
        #   group_by: @group_by, 
        #   value_method: :average_ingestion_time, 
        #   date_method: :timeperiod
        # )
      end

      def sql
        <<~SQL
          SELECT 
            DATE_TRUNC('#{@group_by}', occurred_at) AS timeperiod,
            AVG(ingested_at - occurred_at) AS average_ingestion_time
          FROM events
          WHERE occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
          GROUP BY timeperiod
        SQL
      end
    end
  end
end