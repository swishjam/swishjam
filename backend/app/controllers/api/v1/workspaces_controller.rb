module Api
  module V1
    class WorkspacesController < BaseController
      def index
        render json: current_user.workspaces, status: :ok
      end

      def create
        workspace = current_user.workspaces.new(workspace_params)
        if workspace.save
          render json: { workspace: workspace }, status: :ok
        else
          render json: { error: workspace.errors.full_messages.join('. ') }, status: :unprocessable_entity
        end
      end

      def update
        workspace = current_workspace
        if workspace.update(workspace_params)
          # reset the token with the updated workspace
          # this also resets the expires_at, probably should have a better way to do this but ok for now

          user = log_user_out
          token = log_user_in(user, workspace)
          render json: { workspace: workspace, auth_token: token }, status: :ok
        else
          render json: { error: workspace.errors.full_messages.join('. ') }, status: :unprocessable_entity
        end
      end

      def update_current_workspace
        new_workspace = current_user.workspaces.find(params[:workspace_id])
        user = log_user_out
        token = log_user_in(user, new_workspace)
        render json: { workspace: new_workspace, auth_token: token }, status: :ok
      end

      private

      def workspace_params
        params.require(:workspace).permit(:name, :company_url)
      end
    end
  end
end