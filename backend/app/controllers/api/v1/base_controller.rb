module Api
  module V1
    class BaseController < ApplicationController
      include TimestampHelper
      include AuthenticationHelper
      before_action :authenticate_request!

      def requested_data_source
        @requested_data_source ||= params[:data_source]&.downcase
      end

      def public_keys_for_requested_data_source
        @public_keys_for_requested_data_source ||= current_workspace.api_keys.where(data_source: requested_data_source).pluck(:public_key)
      rescue ActiveRecord::RecordNotFound => e
        Rails.logger.error "No enabled API key found for data source #{requested_data_source} for workspace #{current_workspace.id}"
      end
    end
  end
end