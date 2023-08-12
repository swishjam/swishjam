module Swishjam
  class DataSync < ApplicationRecord
    self.table_name = :swishjam_data_syncs
    belongs_to :organization, class_name: Swishjam::Organization.to_s, foreign_key: :swishjam_organization_id

    validates :provider, presence: true, inclusion: { in: %w[stripe] }
  end
end