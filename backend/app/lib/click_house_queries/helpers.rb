module ClickHouseQueries
  module Helpers
    def formatted_time(time)
      time.strftime('%Y-%m-%d %H:%M:%S')
    end
  end
end