module ClickHouseQueries
  module Events
    class GlobalCountTimeseries
      extend ClickHouseQueries::Helpers

      def self.get
        sql = <<~SQL
          SELECT
            CAST(COUNT(*) AS int) AS count,
            DATE_TRUNC('hour', occurred_at) AS group_by_date
          FROM events
          WHERE occurred_at BETWEEN '#{formatted_time(7.days.ago)}' AND '#{formatted_time(Time.current)}'
          GROUP BY group_by_date
          ORDER BY group_by_date
        SQL
        res = Analytics::Event.find_by_sql(sql)
        DataFormatters::Timeseries.new(
          res, 
          start_time: 7.days.ago,
          end_time: Time.current, 
          group_by: :hour,
          value_method: :count,
          date_method: :group_by_date
        )
      end
    end
  end
end