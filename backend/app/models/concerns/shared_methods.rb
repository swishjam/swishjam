module SharedMethods
  extend ActiveSupport::Concern

  included do
    scope :most_recent_first, -> (column = :created_at) { order(column => :desc) }
    scope :most_recent_last, -> (column = :created_at) { order(column => :asc) }
    # scope :most_recent, -> (column = :created_at) { most_recent_first(column).limit(1).first }
    # scope :least_recent, -> (column = :created_at) { most_recent_last(column).limit(1).first }
    # scope :oldest, -> (column = :created_at) { least_recent(column) }

    def self.most_recent(column = :created_at)
      self.most_recent_first(column).limit(1).first
    end
  
    def self.least_recent(column = :created_at)
      self.most_recent_last(column).limit(1).first
    end

    def self.oldest(column = :created_at)
      self.least_recent(column)
    end
  end
end