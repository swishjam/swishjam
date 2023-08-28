module Analytics
  class UserIdentifyEvent < ClickHouseRecord
    attribute :ingested_at, :datetime, default: -> { Time.current }
  end
end