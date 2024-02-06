module Api
  module V1
    class SlackController < BaseController
      def channels
        slack_connection = Integrations::Destinations::Slack.for_workspace(current_workspace)
        if slack_connection.nil?
          render json: { error: "Must connect your Slack first." }, status: :unprocessable_entity
          return
        end
        slack_client = Slack::Client.new(slack_connection.access_token)
        render json: slack_client.list_channels, status: :ok
      end
    end
  end
end