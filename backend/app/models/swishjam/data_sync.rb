module Swishjam
  class DataSync < ApplicationRecord
    self.table_name = :swishjam_data_syncs
    belongs_to :organization, class_name: Swishjam::Organization.to_s, foreign_key: :swishjam_organization_id

    validates :provider, presence: true, inclusion: { in: %w[stripe] }

    def completed!
      update!(completed_at: Time.current, duration_in_seconds: Time.current - started_at)
    end

    def failed!(error_message)
      update!(error_message: error_message, completed_at: Time.current, duration_in_seconds: Time.current - started_at)
    end
  end
end