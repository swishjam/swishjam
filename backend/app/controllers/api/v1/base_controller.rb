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
        return @public_keys_for_requested_data_source if @public_keys_for_requested_data_source.present?
        case requested_data_source.downcase
        when 'all'
          @public_keys_for_requested_data_source = current_workspace.api_keys.all.pluck(:public_key)
        when 'web'
          @public_keys_for_requested_data_source = current_workspace.api_keys.where(data_source: [ApiKey::ReservedDataSources.PRODUCT, ApiKey::ReservedDataSources.MARKETING]).pluck(:public_key)
        else
          @public_keys_for_requested_data_source = current_workspace.api_keys.where(data_source: requested_data_source).pluck(:public_key)
        end
      end
    end
  end
end