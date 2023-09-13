module Analytics
  class OrganizationIdentifyEvent < ClickHouseRecord
    self.table_name = :organization_identify_events
  end
end