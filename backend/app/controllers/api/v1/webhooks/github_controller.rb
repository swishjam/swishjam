module Api
  module V1
    module Webhooks
      class GithubController < BaseController
        def receive
          installation_id = params.dig('installation', 'id')
          integration = Integrations::Github.find_by_config_attribute('installation_id', installation_id.to_s)
          if integration.nil?
            Sentry.capture_message("Received Github for installation ID #{installation_id}, but unable to find matching Github Integration record.")
            render json: { message: 'OK' }, status: :ok
            return
          end

          workspace = integration.workspace
          public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.GITHUB)&.public_key
          if public_key.nil?
            Sentry.capture_message("Received Github for installation ID #{installation_id}, but unable to find ApiKey record for the workspace (integration: #{integration.id}).")
            render json: { message: 'OK' }, status: :ok
            return
          end

          event_to_prepare = Analytics::Event.formatted_for_ingestion(
            uuid: request.headers['X-GitHub-Delivery'],
            swishjam_api_key: public_key,
            name: ['github', request.headers['X-GitHub-Event'], params.dig('action')].compact.join('.'),
            occurred_at: Time.current, # there are timestamps in each event but they are not consistent, using current time for now
            properties: params.as_json,
          )
          IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter.perform_async([event_to_prepare])
        end
      end
    end
  end
end