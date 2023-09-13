module ClickHouseQueries
  module Organizations
    module Users
      module Active
        class Weekly < Base
          self.default_start_time = 6.months.ago
          self.date_formatter = ->(date) { date.strftime('Week of %a, %b %-d') }
        end
      end
    end
  end
end