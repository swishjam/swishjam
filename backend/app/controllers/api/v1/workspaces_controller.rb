module Api
  module V1
    class WorkspacesController < BaseController
      def update
        if current_workspace.update(workspace_params)
          # reset the token with the updated workspace
          # this also resets the expires_at, probably should have a better way to do this but ok for now
          log_user_out
          token = log_user_in(current_user, current_workspace)
          render json: { workspace: current_workspace, auth_token: token }, status: :ok
        else
          render json: { error: current_workspace.errors.full_messages.join('. ') }, status: :unprocessable_entity
        end
      end

      private

      def workspace_params
        params.require(:workspace).permit(:name)
      end
    end
  end
end