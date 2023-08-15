module Analytics
  class Metadata < ApplicationRecord
    self.table_name = :analytics_metadata

    belongs_to :parent, polymorphic: true
    
    validates :key, presence: true, uniqueness: { scope: [:parent_type, :parent_id] }
    validates :value, presence: true

    class << self
      
      def as_hash
        all.each_with_object({}) do |metadata, hash|
          hash[metadata.key] = metadata.value
        end.with_indifferent_access
      end
      alias to_hash as_hash
      alias formatted as_hash

    end
  end
end