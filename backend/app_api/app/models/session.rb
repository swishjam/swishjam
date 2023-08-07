class Session < ApplicationRecord
  belongs_to :device
  belongs_to :organization, optional: true
  has_many :page_hits, dependent: :destroy
  has_many :events, dependent: :destroy
end