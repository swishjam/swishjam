module Github
  module EventPayloadParsers
    class IssueComment
      def initialize(event_payload)
        @event_payload = event_payload
      end

      def to_json
        {
          repo: @event_payload.dig('repository', 'full_name'),
          issue_title: @event_payload.dig('issue', 'title'),
          issue_username: @event_payload.dig('issue', 'user', 'login'),
          issue_comment_username: @event_payload.dig('comment', 'user', 'login'),
          issue_comment_reactions_total_count: @event_payload.dig('comment', 'reactions', 'total_count'),
          "issue_comment_reactions_+1": @event_payload.dig('comment', 'reactions', '+1'),
          "issue_comment_reactions_-1": @event_payload.dig('comment', 'reactions', '-1'),
          issue_comment_reactions_laugh: @event_payload.dig('comment', 'reactions', 'laugh'),
          issue_comment_reactions_hooray: @event_payload.dig('comment', 'reactions', 'hooray'),
          issue_comment_reactions_confused: @event_payload.dig('comment', 'reactions', 'confused'),
          issue_comment_reactions_heart: @event_payload.dig('comment', 'reactions', 'heart'),
          issue_comment_reactions_rocket: @event_payload.dig('comment', 'reactions', 'rocket'),
          issue_comment_reactions_eyes: @event_payload.dig('comment', 'reactions', 'eyes'),
        }
      end
    end
  end
end