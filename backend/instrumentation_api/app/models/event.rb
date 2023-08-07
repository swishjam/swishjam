class Event < ApplicationRecord
  belongs_to :device
  belongs_to :session
  belongs_to :page_hit
  has_many :metadata, as: :parent, class_name: Metadata.to_s, dependent: :destroy
  accepts_nested_attributes_for :metadata

  def formatted_metadata
    Hash.new.tap do |hash|
      metadata.each{ |meta| hash[meta.key] = meta.value }
    end.with_indifferent_access
  end
end