class WorkspaceInvitation < Transactional
  belongs_to :workspace
  belongs_to :invited_by_user, class_name: User.to_s

  before_create { self.invite_token = "invite-#{SecureRandom.uuid}" }
  before_create { self.expires_at = 7.days.from_now }
  after_create { WorkspaceInvitationMailer.with(workspace_invitation: self).email.deliver_now! }

  validates :workspace, presence: true
  validates :invited_by_user, presence: true
  validate :invited_email_not_part_of_workspace, on: :create

  def accept!
    if !acceptable?
      errors.add(:base, "Invitation is expired, please request a new invite from your admin.")
      false
    else
      update!(accepted_at: Time.current)
    end
  end

  def acceptable?
    !accepted? && !expired?
  end

  def accepted?
    accepted_at.present?
  end

  def expired?
    expires_at < Time.current
  end

  private
  
  def invited_email_not_part_of_workspace
    existing_user = User.find_by(email: invited_email)
    if existing_user && workspace.workspace_members.where(user: existing_user).exists?
      errors.add(:base, "#{invited_email} is already a member of this workspace.")
    end
  end
end