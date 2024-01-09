module Github
  module EventPayloadParsers
    class Star
      def initialize(event_payload)
        @event_payload = event_payload
      end

      def to_json
        {
          repo: @event_payload.dig('repository', 'full_name'),
          total_stars: @event_payload.dig('repository', 'stargazers_count'),
          total_watchers: @event_payload.dig('repository', 'watchers_count'),
          username: @event_payload.dig('sender', 'login'),
        }
      end
    end
  end
end