module Api
  module V1
    class WorkspaceInvitationsController < BaseController
      skip_before_action :authenticate_request!, on: [:show, :accept]

      def show
        invite = WorkspaceInvitation.find_by(invite_token: params[:invite_token])
        render json: invite, serializer: WorkspaceInvitationSerializer, status: :ok
      end

      def create
        invite = current_workspace.workspace_invitations.new(invited_email: params[:email], invited_by_user: current_user)
        if invite.save
          render json: invite, status: :ok
        else
          render json: { error: invite.errors.full_messages.join(' ') }
        end
      end

      def accept
        invitation = WorkspaceInvitation.find_by(invite_token: params[:invite_token])

        case params[:acceptance_method]
        when 'login'
          user = User.find_by(email: params[:email])
          if user && user.authenticate(params[:password])
            accept_invitation(invitation, user)
          else
            render json: { error: "Email or password is incorrect." }, status: :unprocessable_entity
          end
        when 'register'
          user = User.new(email: params[:email], password: params[:password])
          if user.save
            accept_invitation(invitation, user)
          else
            render json: { error: user.errors.full_messages.join(' ') }, status: :unprocessable_entity
          end
        when 'existing'
          if current_user
            accept_invitation(invitation, current_user)
          else
            render json: { error: "Unable to accept invite at this time. Please contact support." }, status: :unprocessable_entity
          end
        else
          render json: { error: "Unrecognized acceptance_method provided." }, status: :unprocessable_entity
        end
      end

      private

      def accept_invitation(invitation, user)
        workspace_member = invitation.workspace.workspace_members.new(user: user)
        if workspace_member.save
          if invitation.accept!
            auth_token = log_user_in(user, invitation.workspace)
            render json: { auth_token: auth_token }, status: :ok
          else
            render json: { error: invitation.errors.full_messages.join(' ') }, status: :unprocessable_entity
          end
        else
          render json: { error: workspace_member.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end

    end
  end
end