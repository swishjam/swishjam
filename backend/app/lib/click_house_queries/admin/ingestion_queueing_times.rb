module ClickHouseQueries
  module Admin
    class IngestionQueueingTimes
      include ClickHouseQueries::Helpers

      def initialize(start_time: 1.day.ago, end_time: Time.current)
        @start_time = start_time
        @end_time = end_time
      end

      def timeseries
        @data ||= Analytics::Event.find_by_sql(sql.squish!)
      end

      def sql
        <<~SQL
          SELECT 
            toStartOfFifteenMinutes(occurred_at) AS timeperiod,
            AVG(toFloat64(ingested_at) - toFloat64(occurred_at)) AS average_seconds_to_ingest
          FROM events
          WHERE occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
          GROUP BY timeperiod
          ORDER BY timeperiod
        SQL
      end
    end
  end
end