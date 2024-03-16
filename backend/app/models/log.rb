class Log < Transactional
  belongs_to :parent, polymorphic: true

  validates :level, presence: true, inclusion: { in: %w[json info warn error success] }
  attribute :timestamp, :datetime, default: -> { Time.current }
end