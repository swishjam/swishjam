class WorkspaceMember < Transactional
  belongs_to :user
  belongs_to :workspace

  validates_uniqueness_of :user_id, scope: :workspace_id
end