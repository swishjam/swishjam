class UserSegment < Transactional
  belongs_to :workspace
  belongs_to :created_by_user, class_name: User.to_s
  has_many :user_segment_filters, dependent: :destroy
  accepts_nested_attributes_for :user_segment_filters, allow_destroy: true
end