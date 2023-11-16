module Api
  module V1
    module Admin
      class DataSyncsController < BaseController
        def index
          syncs = DataSync.all.order(started_at: :desc).limit(50).map do |sync|
            {
              id: sync.id,
              provider: sync.provider,
              started_at: sync.started_at,
              completed_at: sync.completed_at,
              duration_in_seconds: sync.duration_in_seconds,
              error_message: sync.error_message,
              workspace: {
                id: sync.workspace.id,
                name: sync.workspace.name,
              },
            }
          render json: syncs, status: :ok
        end
      end
    end
  end
end