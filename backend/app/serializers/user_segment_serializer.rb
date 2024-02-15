class UserSegmentSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :created_at, :updated_at, :created_by_user, :user_segment_filters

  def user_segment_filters
    object.user_segment_filters.order(sequence_position: :ASC)
  end
end