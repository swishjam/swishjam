class QueryFilterGroupSerializer < ActiveModel::Serializer
  attributes :id, :sequence_index, :previous_query_filter_group_relationship_operator, :query_filters

  def query_filters
    object.query_filters.in_sequence_order.map do |query_filter|
      {
        id: query_filter.id,
        type: query_filter.type,
        sequence_index: query_filter.sequence_index,
        previous_query_filter_relationship_operator: query_filter.previous_query_filter_relationship_operator,
        config: query_filter.config,
      }
    end
  end
end