class Log < Transactional
  LEVELS = %w[info warn error success].freeze
  belongs_to :parent, polymorphic: true

  validates :level, presence: true, inclusion: { in: LEVELS }

  attribute :metadata, :jsonb, default: {}
  attribute :timestamp, :datetime, default: -> { Time.current }

  LEVELS.each do |level|
    define_singleton_method(level) do |message, metadata = {}|
      new(level: level, message: message, metadata: metadata)
    end

    define_singleton_method(:"#{level}!") do |message, metadata = {}|
      create!(level: level, message: message, metadata: metadata)
    end

    define_method("#{level}?") do
      self.level == level
    end
  end
end