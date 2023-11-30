module ClickHouseQueries
  module Users
    module Active
      class Daily < Base
        self.sql_date_trunc_unit = 'day'
        self.filled_in_results_increment = 1.day
        self.default_start_time = 30.days.ago 
        self.date_formatter = ->(date) { date.strftime('%a, %b %-d') }
      end
    end
  end
end