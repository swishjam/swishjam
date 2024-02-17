class UserSegmentFilter < Transactional
  belongs_to :user_segment
  belongs_to :parent_filter, class_name: UserSegmentFilter.to_s, optional: true
  has_many :child_filters, class_name: UserSegmentFilter.to_s, foreign_key: :parent_filter_id, dependent: :destroy

  validate :has_valid_config
  validates :sequence_position, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 1 }, uniqueness: { scope: :user_segment_id }
  validates :parent_relationship_operator, inclusion: { in: %w[and or] }, if: -> { sequence_position > 1 }

  scope :in_order, -> { order(sequence_position: :ASC) }

  private

  def has_valid_config
    if !['user', 'event'].include?(config['object_type'])
      errors.add(:config, 'object_type must be either "user" or "event"')
    elsif config['object_type'] == 'event'
      required_keys = %w[event_name num_lookback_days num_event_occurrences]
      required_keys.each do |key|
        errors.add(:config, "missing required key: #{key}") unless config[key].present?
      end
    elsif config['object_type'] == 'user'
      required_keys = %w[user_property_name user_property_operator user_property_value]
      required_keys.each do |key|
        errors.add(:config, "missing required key: #{key}") unless config[key].present?
      end
    end
  end
end