class Integration < ApplicationRecord
  belongs_to :instance

  scope :enabled, -> { where(enabled: true) }
  scope :disabled, -> { where(enabled: false) }
end