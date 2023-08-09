module Analytics
  class Device < ApplicationRecord
    self.table_name = :analytics_devices
    belongs_to :instance
    belongs_to :user, optional: true
    has_many :sessions
    has_many :page_hits
    has_many :events
  end
end