module ClickHouseQueries
  module Organizations
    module Users
      module Active
        class Daily < Base
          self.default_start_time = 30.days.ago 
          self.date_formatter = ->(date) { date.strftime('%a, %b %-d') }
        end
      end
    end
  end
end