module Github
  module EventPayloadParsers
    class PullRequest
      def initialize(event_payload)
        @event_payload = event_payload
      end

      def to_json
        {
          title: @event_payload.dig('pull_request', 'title'),
          number: @event_payload.dig('pull_request', 'number'),
          repo: @event_payload.dig('repository', 'full_name'),
          num_commits: @event_payload.dig('pull_request', 'commits'),
          num_additions: @event_payload.dig('pull_request', 'additions'),
          num_deletions: @event_payload.dig('pull_request', 'deletions'),
          num_changed_files: @event_payload.dig('pull_request', 'changed_files'),
          merged: @event_payload.dig('pull_request', 'merged'),
        }
      end
    end
  end
end