class UserSegment < Transactional
  belongs_to :workspace
  belongs_to :created_by_user, class_name: User.to_s
end