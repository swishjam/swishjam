module Ingestion
  module ClickHouseWriters
    class ClickHouseUserProfiles < Base
      self.analytics_model = Analytics::SwishjamUserProfile
    end
  end
end