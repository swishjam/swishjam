module Api
  module V1
    class WorkspaceMembersController < BaseController
      def destroy
        # SHOULD WE ALSO REMOVE ALL SESSIONS ASSOCIATED TO THIS USER? OR JUST LET IT ERROR OUT ON THEIR NEXT ACTION?
        workspace_member = current_workspace.workspace_members.find(params[:id])
        if workspace_member.destroy
          render json: workspace_member, status: :ok
        else
          render json: { error: workspace_member.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end
    end
  end
end