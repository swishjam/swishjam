module ClickHouseQueries
  module Helpers
    def formatted_time(time)
      time.strftime('%Y-%m-%d %H:%M:%S')
      # time.strftime('%Y-%m-%d')
    end

    def formatted_in_clause(array)
      "(#{array.map{ |item| "'#{item}'" }.join(', ')})"
    end
    alias formatted_in_statement formatted_in_clause
  end
end