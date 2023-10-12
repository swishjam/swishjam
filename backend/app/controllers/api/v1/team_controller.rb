module Api
  module V1
    class TeamController < BaseController
      def users
        render json: current_workspace.users, status: :ok
      end

      def workspace_members
        render json: current_workspace.workspace_members, each_serializer: WorkspaceMemberSerializer, status: :ok
      end
    end
  end
end