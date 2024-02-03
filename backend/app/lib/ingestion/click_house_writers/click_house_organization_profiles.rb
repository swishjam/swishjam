module Ingestion
  module ClickHouseWriters
    class ClickHouseOrganizationProfiles < Base
      self.analytics_model = Analytics::SwishjamOrganizationProfile
    end
  end
end