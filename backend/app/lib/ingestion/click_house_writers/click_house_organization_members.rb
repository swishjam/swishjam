module Ingestion
  module ClickHouseWriters
    class ClickHouseOrganizationMembers < Base
      self.analytics_model = Analytics::SwishjamOrganizationMember
    end
  end
end