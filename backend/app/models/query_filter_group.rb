class QueryFilterGroup < Transactional
  belongs_to :filterable, polymorphic: true
  belongs_to :parent_query_filter_group, class_name: QueryFilterGroup.to_s, optional: true
  has_many :child_query_filter_groups, class_name: QueryFilterGroup.to_s, foreign_key: :parent_query_filter_group_id, dependent: :destroy
  has_many :query_filters, dependent: :destroy

  validates :sequence_index, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, uniqueness: { scope: :query_filter_group }
  validates :previous_query_filter_group_relationship_operator, inclusion: { in: %w[and or] }, if: -> { sequence_index > 0 }

  scope :in_sequence_order, -> { order(sequence_index: :ASC) }
end