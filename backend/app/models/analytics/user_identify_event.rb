module Analytics
  class UserIdentifyEvent < ClickHouseRecord
    self.table_name = :user_identify_events
  end
end