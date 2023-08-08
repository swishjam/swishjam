class User < ApplicationRecord
  belongs_to :instance
  belongs_to :organization, optional: true
  has_many :devices, dependent: :destroy
  has_many :sessions, dependent: :destroy
  has_many :page_hits, dependent: :destroy
  has_many :events, dependent: :destroy
  has_many :metadata, as: :parent, class_name: Metadata.to_s, dependent: :destroy
  accepts_nested_attributes_for :metadata
end