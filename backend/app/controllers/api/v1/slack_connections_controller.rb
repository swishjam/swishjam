module Api
  module V1
    class SlackConnectionsController < BaseController
      def index
        slack_connection = Integrations::Destinations::Slack.for_workspace(current_workspace)
        render json: slack_connection, status: :ok
      end
    end
  end
end