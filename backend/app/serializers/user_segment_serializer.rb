class UserSegmentSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :created_at, :updated_at, :created_by_user, :query_filter_groups, :rough_user_count, :last_synced_profile_tags_at

  def created_by_user
    object.created_by_user.as_json(only: %i[id name email])
  end

  def query_filter_groups
    object.query_filter_groups.in_sequence_order.map do |query_filter_group|
      QueryFilterGroupSerializer.new(query_filter_group)
    end
  end

  def rough_user_count
    object.profile_tags.count
  end

  def last_synced_profile_tags_at
    object.most_recent_data_sync&.completed_at
  end
end