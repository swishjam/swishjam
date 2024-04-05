module SharedMethods
  extend ActiveSupport::Concern
  class MissingConfigValueError < StandardError; end

  included do |base|
    scope :most_recent_first, -> (column = :created_at) { order(column => :desc) }
    scope :most_recent_last, -> (column = :created_at) { order(column => :asc) }
  
    class << self
      attr_accessor :destroy_in_background_job
    end

    def destroy(_is_in_background: false)
      if self.class.destroy_in_background_job == true && !_is_in_background
        DestroyRecordJob.perform_async(self.class.to_s, id)
        'enqueued destroy job'
      else
        super()
      end
    end
    alias_method :destroy!, :destroy

    def self.most_recent(column = :created_at)
      self.most_recent_first(column).limit(1).first
    end
  
    def self.least_recent(column = :created_at)
      self.most_recent_last(column).limit(1).first
    end

    def self.oldest(column = :created_at)
      self.least_recent(column)
    end

    def self.older_than(time, column: :created_at)
      where("#{column} < ?", time)
    end
  end
end