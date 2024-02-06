module Api
  module V1
    class SlackConnectionsController < BaseController
      def index
        raise NotImplementedError, "SlackConnections are now deprecated in favor of using `Integrations::Destinations::Slack`."
        # render json: current_workspace.slack_connection, status: :ok
      end
    end
  end
end