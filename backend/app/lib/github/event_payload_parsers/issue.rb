module Github
  module EventPayloadParsers
    class Issue
      def initialize(event_payload)
        @event_payload = event_payload
      end

      def as_json
        {
          repo: @event_payload.dig('repository', 'full_name'),
          title: @event_payload.dig('issue', 'title'),
          username: @event_payload.dig('issue', 'user', 'login'),
          reactions_total_count: @event_payload.dig('issue', 'reactions', 'total_count'),
          "reactions_+1": @event_payload.dig('issue', 'reactions', '+1'),
          "reactions_-1": @event_payload.dig('issue', 'reactions', '-1'),
          reactions_laugh: @event_payload.dig('issue', 'reactions', 'laugh'),
          reactions_hooray: @event_payload.dig('issue', 'reactions', 'hooray'),
          reactions_confused: @event_payload.dig('issue', 'reactions', 'confused'),
          reactions_heart: @event_payload.dig('issue', 'reactions', 'heart'),
          reactions_rocket: @event_payload.dig('issue', 'reactions', 'rocket'),
          reactions_eyes: @event_payload.dig('issue', 'reactions', 'eyes'),
          labels: @event_payload.dig('issue', 'labels').join(', '),
        }
      end
    end
  end
end