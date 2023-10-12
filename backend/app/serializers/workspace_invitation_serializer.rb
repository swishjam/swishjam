class WorkspaceInvitationSerializer < ActiveModel::Serializer
  attributes :id, :invite_token, :invited_email, :expires_at, :accepted_at, :invited_by_user, :workspace

  def invited_by_user
    { email: object.invited_by_user.email }
  end

  def workspace
    { name: object.workspace.name }
  end
end