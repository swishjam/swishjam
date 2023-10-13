class WorkspaceInvitationSerializer < ActiveModel::Serializer
  attributes :id, :invite_token, :invited_email, :expires_at, :accepted_at, :invited_by_user, :is_acceptable, :workspace, :invited_email_is_existing_user

  def invited_by_user
    { id: object.invited_by_user.id,  email: object.invited_by_user.email }
  end

  def workspace
    { id: object.workspace.id,  name: object.workspace.name }
  end

  def invited_email_is_existing_user
    User.exists?(email: object.invited_email)
  end

  def is_acceptable
    object.acceptable?
  end
end