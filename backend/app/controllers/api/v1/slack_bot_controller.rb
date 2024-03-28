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
        when '/swishjam-whois'
          blocks = ::Slack::SwishjamBot::SlashCommandHandlers::WhoIs.new(@workspace, params).return_slash_response
        else
          raise InvalidSlashCommandError, "Received invalid Slack bot command: #{@payload[:command]}"
        end
        render json: { blocks: blocks }, status: :ok
      end

      private

      def authenticate_bot!
        timestamp = request.headers['X-Slack-Request-Timestamp']
        if timestamp.nil? || Time.now.to_i - timestamp.to_i > 5.minutes
          render json: { error: "Unauthorized" }, status: :unauthorized
          return
        end

        # should this always be v0? safe to just use the value from the header?
        version = request.headers['X-Slack-Signature'].split('=').first 
        signature_base = [version, timestamp, request.raw_post].join(':')
        computed_signature = OpenSSL::HMAC.hexdigest('SHA256', ENV['SLACK_SIGNING_SECRET'], signature_base)
        is_valid_signature = Rack::Utils.secure_compare(request.headers['X-Slack-Signature'], "#{version}=#{computed_signature}")
        if !is_valid_signature
          render json: { error: "Unauthorized" }, status: :unauthorized
          return
        end

        team_id = params[:team_id] || JSON.parse(params[:payload] || '{}').dig('team', 'id')
        if team_id.nil?
          render json: { error: "Unauthorized" }, status: :unauthorized
          return
        end

        integrations = Integrations::Destinations::Slack.enabled.find_all_by_team_id(team_id)
        if integrations.empty?
          render json: { error: "Unauthorized" }, status: :unauthorized
          return
        end

        if integrations.length > 1
          Sentry.capture_message("Multiple Slack integrations found for team_id: #{team_id}, trying to find one for matching Channel...")
          channel_id = params[:channel_id] || JSON.parse(params[:payload] || '{}').dig('channel', 'id') || JSON.parse(JSON.parse(params[:payload] || '{}').dig('view', 'private_metadata') || '{}')['channel_id']
          if channel_id.nil?
            render json: { error: "Unauthorized" }, status: :unauthorized
            return
          end
          integrations = integrations.where("config->>'webhook_channel_id' = ?", channel_id)
          if integrations.empty? || integrations.length > 1
            render json: { error: "Unauthorized" }, status: :unauthorized
            return
          end
        end
        @integration = integrations.first
        @workspace = @integration.workspace
      end

      def swishjam_integration
        @swishjam_integration ||= Integrations::Destinations::Slack.find_by_team_id(params[:team_id])
      end

    end
  end
end