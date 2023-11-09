class WorkspaceInvitationMailer < ApplicationMailer
  default from: 'Swishjam <hello@swishjam.com>'

  def email
    @workspace_invitation = params[:workspace_invitation]
    mail(
      to: [@workspace_invitation.invited_email], 
      subject: "You've been invited to join the #{@workspace_invitation.workspace.name} team on Swishjam."
    )
  end
end