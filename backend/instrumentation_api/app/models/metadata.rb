class Metadata < ApplicationRecord
  self.table_name = :metadata

  belongs_to :parent, polymorphic: true
  
  validates :key, presence: true, uniqueness: { scope: [:parent_type, :parent_id] }
  validates :value, presence: true
end