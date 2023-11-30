module ClickHouseQueries
  module Users
    module Active
      class Weekly < Base
        self.sql_date_trunc_unit = 'week'
        self.filled_in_results_increment = 1.week
        self.default_start_time = 6.months.ago
        self.date_formatter = ->(date) { date.strftime('Week of %b %-d') }
      end
    end
  end
end