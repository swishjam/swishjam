class Log < Transactional
  LEVELS = %w[json info warn error success].freeze
  belongs_to :parent, polymorphic: true

  validates :level, presence: true, inclusion: { in: LEVELS }
  attribute :timestamp, :datetime, default: -> { Time.current }

  LEVELS.each do |level|
    define_singleton_method(level) do |message|
      new(level: level, message: message)
    end

    define_singleton_method(:"#{level}!") do |message|
      create!(level: level, message: message)
    end

    define_method("#{level}?") do
      self.level == level
    end
  end
end