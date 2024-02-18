class QueryFilter < Transactional
  class << self
    attr_accessor :required_config_keys
  end

  belongs_to :query_filter_group

  validate :has_valid_config
  validates :sequence_index, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, uniqueness: { scope: :query_filter_group }
  validates :previous_query_filter_relationship_operator, inclusion: { in: %w[and or] }, if: -> { sequence_index > 0 }

  scope :in_sequence_order, -> { order(sequence_index: :ASC) }

  private

  def has_valid_config
    raise NotImplementedError, "Must implement `required_config_keys` in subclass #{self.class}." if self.class.required_config_keys.nil?
    self.class.required_config_keys.each do |key|
      errors.add(:config, "missing required key: #{key}") unless config[key.to_s].present?
    end
  end
end