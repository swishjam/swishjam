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
        if !invitation.acceptable?
          render json: { error: "Invitation is no longer valid." }, status: :unprocessable_entity
          return
        end

        case params[:acceptance_method]
        when 'login'
          user = User.find_by(email: params[:email])
          if user && user.authenticate(params[:password])
            if invitation.workspace.users.find(user.id)
              render json: { error: "#{user.email} is already a member of this workspace." }, status: :unprocessable_entity
            else
              auth_token = log_user_in(user, invitation.workspace)
              invitation.workspace.users << user
              invitation.accept!
              render json: { auth_token: auth_token }, status: :ok
            end
          else
            render json: { error: "Email or password is incorrect." }, status: :unprocessable_entity
          end
        when 'register'
          user = User.new(email: params[:email], password: params[:password])
          if user.save
            auth_token = log_user_in(user, invitation.workspace)
            invitation.workspace.users << user
            invitation.accept!
            render json: { auth_token: auth_token }, status: :ok
          else
            render json: { error: user.errors.full_messages.join(' ') }, status: :unprocessable_entity
          end
        when 'existing'
          if current_user
            auth_token = log_user_in(current_user, invitation.workspace)
            invitation.workspace.users << current_user
            invitation.accept!
            render json: { auth_token: auth_token }, status: :ok
          else
            render json: { error: "Unable to accept invite at this time. Please contact support." }, status: :unprocessable_entity
          end
        else
          render json: { error: "Unrecognized acceptance_method provided." }, status: :unprocessable_entity
        end
      end

    end
  end
end