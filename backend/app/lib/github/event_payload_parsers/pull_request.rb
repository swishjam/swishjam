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
          head_branch_ref: @event_payload.dig('pull_request', 'head', 'ref'),
          head_branch_label: @event_payload.dig('pull_request', 'head', 'label'),
          base_branch_ref: @event_payload.dig('pull_request', 'base', 'ref'),
          base_branch_label: @event_payload.dig('pull_request', 'base', 'label'),
          num_commits: @event_payload.dig('pull_request', 'commits'),
          num_additions: @event_payload.dig('pull_request', 'additions'),
          num_deletions: @event_payload.dig('pull_request', 'deletions'),
          num_changed_files: @event_payload.dig('pull_request', 'changed_files'),
          merged: @event_payload.dig('pull_request', 'merged'),
          closed: @event_payload.dig('pull_request', 'closed'),
          state: @event_payload.dig('pull_request', 'state'),
          merged_at: @event_payload.dig('pull_request', 'merged_at'),
          closed_at: @event_payload.dig('pull_request', 'closed_at'),
          seconds_to_close: seconds_to_close,
          seconds_to_merge: seconds_to_merge,
          minutes_to_close: seconds_to_close ? (seconds_to_close / 60.0).round(2) : nil,
          minutes_to_merge: seconds_to_merge ? (seconds_to_merge / 60.0).round(2) : nil,
          hours_to_close: seconds_to_close ? (seconds_to_close / 3600.0).round(2) : nil,
          hours_to_merge: seconds_to_merge ? (seconds_to_merge / 3600.0).round(2) : nil,
          days_to_close: seconds_to_close ? (seconds_to_close / 86400.0).round(2) : nil,
          days_to_merge: seconds_to_merge ? (seconds_to_merge / 86400.0).round(2) : nil,
        }
      end

      def seconds_to_close
        return if @event_payload.dig('pull_request', 'closed_at').nil?
        DateTime.parse(@event_payload.dig('pull_request', 'closed_at')).to_i - DateTime.parse(@event_payload.dig('pull_request', 'created_at')).to_i
      end

      def seconds_to_merge
        return if @event_payload.dig('pull_request', 'merged_at').nil?
        DateTime.parse(@event_payload.dig('pull_request', 'merged_at')).to_i - DateTime.parse(@event_payload.dig('pull_request', 'created_at')).to_i
      end
    end
  end
end