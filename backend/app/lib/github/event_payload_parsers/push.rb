module Github
  module EventPayloadParsers
    class Push
      def initialize(event_payload)
        @event_payload = event_payload
      end

      def to_json
        {
          repo: @event_payload.dig('repository', 'full_name'),
          pusher_email: @event_payload.dig('pusher', 'email'),
          pusher_name: @event_payload.dig('pusher', 'name'),
          pusher_username: @event_payload.dig('pusher', 'username'),
          most_recent_commit_sha: @event_payload.dig('after'),
          ref: @event_payload.dig('ref'),
          commit_messages: @event_payload.dig('commits').map { |commit| commit.dig('message') },
        }
      end
    end
  end
end