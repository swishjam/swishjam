module Analytics
  class Organization < ApplicationRecord
    self.table_name = :analytics_organizations
    belongs_to :instance
    has_many :users, dependent: :destroy
    has_many :sessions, dependent: :destroy
    has_many :page_hits, dependent: :destroy
  end
end