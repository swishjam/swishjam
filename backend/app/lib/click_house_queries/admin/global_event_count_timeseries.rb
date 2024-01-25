module ClickHouseQueries
  module Admin
    class GlobalEventCountTimeseries
      extend ClickHouseQueries::Helpers

      def self.get(start_time: 7.days.ago, end_time: Time.current)
        start_time = start_time.beginning_of_hour
        end_time = end_time.end_of_hour
        sql = <<~SQL
          SELECT
            CAST(COUNT(*) AS int) AS count,
            DATE_TRUNC('hour', occurred_at) AS group_by_date
          FROM events
          WHERE occurred_at BETWEEN '#{formatted_time(start_time)}' AND '#{formatted_time(end_time)}'
          GROUP BY group_by_date
          ORDER BY group_by_date
        SQL
        res = Analytics::Event.find_by_sql(sql)
        DataFormatters::Timeseries.new(
          res, 
          start_time: start_time,
          end_time: end_time, 
          group_by: :hour,
          value_method: :count,
          date_method: :group_by_date
        )
      end
    end
  end
end