module Analytics
  class BillingDataSnapshot < ClickHouseRecord
    self.table_name = :billing_data_snapshots
  end
end