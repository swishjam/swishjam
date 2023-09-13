module ClickHouseQueries
  module Organizations
    module Users
      module Active
        class Monthly < Base
          self.default_start_time = 12.months.ago
          self.date_formatter = ->(date) { date.strftime('Week of %a, %b %-d') }
        end
      end
    end
  end
end