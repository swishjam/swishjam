class SessionsController < ApplicationController
  def create
    user = User.find_by(email: params[:email])
    if user && user.authenticate(params[:password])
      token = log_user_in(user)
      render json: { user: user, token: token }, status: :ok
    else
      render json: { error: 'unauthorized' }, status: :unauthorized
    end
  end

  def destroy
    log_user_out
    render json: { message: 'logged out' }, status: :ok
  rescue => e
    Rails.logger.error "Failed to log user out."
    Rails.logger.error e.message
    render json: { error: e.message }, status: :unauthorized
  end
end