module Api
  module V1
    module Admin
      class DataSyncsController < BaseController
        def index
          render json: DataSync.all.limit(50), status: :ok
        end
      end
    end
  end
end