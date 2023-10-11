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
        verify_valid_public_keys_for_data_source!
        case requested_data_source.downcase
        when 'all'
          @public_keys_for_requested_data_source = current_workspace.api_keys.all.pluck(:public_key)
        when 'web'
          @public_keys_for_requested_data_source = current_workspace.api_keys.where(data_source: [ApiKey::ReservedDataSources.PRODUCT, ApiKey::ReservedDataSources.MARKETING]).pluck(:public_key)
        else
          byebug
          if [ApiKey::ReservedDataSources.PRODUCT, ApiKey::ReservedDataSources.MARKETING].include?(requested_data_source) && current_workspace.settings.combine_marketing_and_product_data_sources
            @public_keys_for_requested_data_source = current_workspace.api_keys.where(data_source: [ApiKey::ReservedDataSources.PRODUCT, ApiKey::ReservedDataSources.MARKETING]).pluck(:public_key)
          else
            @public_keys_for_requested_data_source = current_workspace.api_keys.where(data_source: requested_data_source).pluck(:public_key)
          end
        end
      end

      def verify_valid_public_keys_for_data_source!
        if requested_data_source.nil?
          render json: { error: "Must provide a `data_source` parameter." }, status: :bad_request
          return
        elsif !['all', 'web'].concat(current_workspace.api_keys.pluck(:data_source)).include?(requested_data_source)
          render json: { error: "Invalid data_source requested #{requested_data_source}" }, status: :bad_request
          return
        end
      end
    end
  end
end