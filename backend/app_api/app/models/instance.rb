class Instance < ApplicationRecord
  has_many :organizations, dependent: :destroy
  has_many :users, dependent: :destroy
  has_many :devices, dependent: :destroy
  has_many :sessions, through: :devices
end