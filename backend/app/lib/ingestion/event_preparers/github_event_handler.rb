module Ingestion
  module EventPreparers
    class GithubEventHandler < Base
      PROPERTY_PARSER_DICT = {
        'pull_request'=> ::Github::EventPayloadParsers::PullRequest,
        'push'=> ::Github::EventPayloadParsers::Push,
        'star'=> ::Github::EventPayloadParsers::Star,
        'issues'=> ::Github::EventPayloadParsers::Issue,
        'issue_comment'=> ::Github::EventPayloadParsers::IssueComment,
        'deployment'=> ::Github::EventPayloadParsers::Deployment,
      }

      def handle_and_return_prepared_events!
        parsed_event.override_properties!(properties)
        parsed_event
      end

      private

      def properties
        @properties ||= begin
          parser = PROPERTY_PARSER_DICT[event.name]
          if parser
            parser.new(parsed_event.properties).as_json
          else
            Sentry.capture_message("Received Github event of type #{event.name}, but no parser exists to ingest the event.")
            {}
          end
        end
      end
    end
  end
end