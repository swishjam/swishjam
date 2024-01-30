module Ingestion
  module ClickHouseWriters
    class PreparedEvents < Base
      self.analytics_model = Analytics::Event
    end
  end
end