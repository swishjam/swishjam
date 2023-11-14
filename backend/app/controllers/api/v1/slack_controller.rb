module Api
  module V1
    class SlackController < BaseController
      def channels
        if !current_workspace.slack_connection
          render json: { error: "Must connect your Slack first." }, status: :unprocessable_entity
          return
        end
        slack_client = Slack::Client.new(current_workspace.slack_connection.access_token)
        render json: slack_client.list_channels, status: :ok
      end
    end
  end
end