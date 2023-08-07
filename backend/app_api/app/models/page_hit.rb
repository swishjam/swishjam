class PageHit < ApplicationRecord
  belongs_to :device
  belongs_to :session
  has_many :events, dependent: :destroy
end