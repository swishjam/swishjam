class DataSync < ApplicationRecord
  belongs_to :instance

  validates :provider, presence: true, inclusion: { in: %w[stripe] }
end