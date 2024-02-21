module ClickHouseQueries
  module Helpers
    def select_clickhouse_timestamp_with_timezone(column)
      "concat(toString(toDateTime(#{column}), 'UTC'), ' GMT-0800')"
    end

    def formatted_time(time)
      time.strftime('%Y-%m-%d %H:%M:%S')
      # time.strftime('%Y-%m-%d')
    end

    def formatted_date(date)
      date.strftime('%Y-%m-%d')
    end

    def formatted_in_clause(array)
      "(#{array.map{ |item| "'#{item}'" }.join(', ')})"
    end
    alias formatted_in_statement formatted_in_clause
  end
end