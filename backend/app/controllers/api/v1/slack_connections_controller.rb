module Api
  module V1
    class SlackConnectionsController < BaseController
      def index
        render json: current_workspace.slack_connection, status: :ok
      end
    end
  end
end