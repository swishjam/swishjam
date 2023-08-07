class ApplicationController < ActionController::API
  # include ActionController::MimeResponds
  # include ActionController::ImplicitRender
  # include ActionController::Serialization
  # include ActionController::HttpAuthentication::Token::ControllerMethods

  before_action :authenticate

  def authenticate
    @api_key = request.headers['X-Swishjam-Api-Key']
    if @api_key.nil?
      render json: { message: 'No API key provided' }, status: :unauthorized
      return
    end
  end
end