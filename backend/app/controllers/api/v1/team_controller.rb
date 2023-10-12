module Api
  module V1
    class TeamController < BaseController
      def users
        render json: current_workspace.users, status: :ok
      end
    end
  end
end