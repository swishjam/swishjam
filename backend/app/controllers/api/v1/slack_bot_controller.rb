module Api
  module V1
    class SlackBotController < ApplicationController
      before_action :authenticate_bot!

      def action
        payload = JSON.parse(params[:payload])
        results = {}
        case payload['type']
        when 'block_actions'
          results = ::Slack::SwishjamBot::ActionHandlers::BlockActions.new(@integration, payload).handle_action
        when 'view_submission'
          results = ::Slack::SwishjamBot::ActionHandlers::ViewSubmission.new(@integration, payload).handle_action
        when 'message_action'
          results = ::Slack::SwishjamBot::ActionHandlers::MessageAction.new(@integration, payload).handle_action
        else
          render json: { error: "Invalid action type" }, status: :bad_request
          return
        end
        render json: results || {}, status: :ok
      end

      def slash_command
        blocks = []
        case params[:command]
        when '/swishjam-whois', '/swishjam-dev-whois'
          blocks = ::Slack::SwishjamBot::SlashCommandHandlers::WhoIs.new(@workspace, params).return_slash_response
        else
          Sentry.capture_message("Received invalid Slack bot command: #{params[:command]}")
          render json: { "response_type": "ephemeral", "text": "Unrecognized Slash command #{params[:command]}, how'd you get here?" }, status: :ok
          return
        end
        render json: { blocks: blocks }, status: :ok
      end

      private

      def authenticate_bot!
        timestamp = request.headers['X-Slack-Request-Timestamp']
        if timestamp.nil? || Time.now.to_i - timestamp.to_i > 5.minutes
          Sentry.capture_message("Invalid Slack request timestamp received in Slack Bot request")
          render json: { error: "Unauthorized" }, status: :unauthorized
          return
        end

        # should this always be v0? safe to just use the value from the header?
        version = request.headers['X-Slack-Signature'].split('=').first 
        signature_base = [version, timestamp, request.raw_post].join(':')
        computed_signature = OpenSSL::HMAC.hexdigest('SHA256', ENV['SLACK_SIGNING_SECRET'], signature_base)
        is_valid_signature = Rack::Utils.secure_compare(request.headers['X-Slack-Signature'], "#{version}=#{computed_signature}")
        if !is_valid_signature
          Sentry.capture_message("Invalid Slack signature received")
          render json: { error: "Unauthorized" }, status: :unauthorized
          return
        end

        team_id = params[:team_id] || JSON.parse(params[:payload] || '{}').dig('team', 'id')
        if team_id.nil?
          Sentry.capture_message("No team_id found in Slack Bot request")
          render json: { error: "Unauthorized" }, status: :unauthorized
          return
        end

        integrations = Integrations::Destinations::Slack.enabled.find_all_by_team_id(team_id)
        if integrations.empty?
          Sentry.capture_message("No Slack integrations found for team_id: #{team_id} in Slack Bot request")
          render json: { error: "Unauthorized" }, status: :unauthorized
          return
        end

        if integrations.length > 1
          Sentry.capture_message("Multiple Slack integrations found for team_id: #{team_id} in Slack Bot request, trying to find one for matching Channel...")
          channel_id = params[:channel_id] || JSON.parse(params[:payload] || '{}').dig('channel', 'id') || JSON.parse(JSON.parse(params[:payload] || '{}').dig('view', 'private_metadata') || '{}')['channel_id']
          if channel_id.nil?
            Sentry.capture_message("No channel_id found in Slack Bot request")
            render json: { error: "Unauthorized" }, status: :unauthorized
            return
          end
          integrations = integrations.where("config->>'webhook_channel_id' = ?", channel_id)
          if integrations.empty? || integrations.length > 1
            Sentry.capture_message("Could not find a single Slack integration for team_id: #{team_id} and channel_id: #{channel_id} in Slack Bot request")
            render json: { "response_type": "ephemeral", "text": "Cannot execute Swishjam Slack bot commands in this channel." }, status: :ok
            return
          end
        end
        @integration = integrations.first
        @workspace = @integration.workspace
      end

    end
  end
end