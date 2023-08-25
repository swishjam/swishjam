module ClickHouseQueries
  module Users
    module Active
      class Monthly < Base
        self.sql_date_trunc_unit = 'month'
        self.filled_in_results_increment = 1.month
        self.default_start_time = 12.months.ago 
        self.date_formatter = ->(date) { date.strftime('%B %Y') }
      end
    end
  end
end