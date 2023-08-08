class Instance < ApplicationRecord
  has_many :organizations, dependent: :destroy
  has_many :users, dependent: :destroy
  has_many :devices, dependent: :destroy
  has_many :sessions, through: :devices

  def page_hits
    PageHit.joins(session: { device: :instance }).where(instances: { id: id })
  end
end