module Analytics
  class CustomerBillingDataSnapshot < ClickHouseRecord
    self.table_name = :customer_billing_data_snapshots
  end
end