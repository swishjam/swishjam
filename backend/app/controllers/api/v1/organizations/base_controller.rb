module Api
  module V1
    module Organizations
      class BaseController < ::Api::V1::BaseController
        before_action :set_organization

        private

        def set_organization
          @organization ||= current_organization.analytics_organizations.find(params[:organization_id])
        end
      end
    end
  end
end