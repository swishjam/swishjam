class QueryFilterGroup < Transactional
  belongs_to :filterable, polymorphic: true
  belongs_to :parent_query_filter_group, class_name: QueryFilterGroup.to_s, optional: true
  has_many :child_query_filter_groups, class_name: QueryFilterGroup.to_s, foreign_key: :parent_query_filter_group_id, dependent: :destroy
  has_many :query_filters, dependent: :destroy
  accepts_nested_attributes_for :query_filters, allow_destroy: true

  # TODO: I don't think we actually need sequence_index, the queries should technically work no matter what order they are in
  # validates :sequence_index, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, uniqueness: { scope: :filterable }
  validate :has_valid_operator
  # validate :has_at_least_one_query_filter

  scope :in_sequence_order, -> { order(sequence_index: :ASC) }

  def workspace_id
    filterable.workspace_id
  end

  private

  def has_at_least_one_query_filter
    if query_filters.empty?
      errors.add(:base, "Query filter group must have at least one query filter")
    end
  end

  def has_valid_operator
    if sequence_index > 0 && !%w[and or AND OR].include?(previous_query_filter_group_relationship_operator)
      errors.add(:base, "Query filter group that is not the first group must have a `previous_query_filter_group_relationship_operator` equal to 'and' or 'or', received: #{previous_query_filter_group_relationship_operator}")
    end
  end
end