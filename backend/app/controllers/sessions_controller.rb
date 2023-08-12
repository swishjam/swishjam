class SessionsController < ApplicationController
  def create
    user = Swishjam::User.find_by(email: params[:email])
    if user && user.authenticate(params[:password])
      token = log_user_in(user, user.organizations.first)
      render json: { user: user, token: token }, status: :ok
    else
      render json: { error: 'Invalid email or password.' }, status: :unauthorized
    end
  end

  def destroy
    log_user_out
    render json: { message: 'logged out' }, status: :ok
  rescue => e
    Rails.logger.error "Failed to log user out, but going to return 200 anyway to allow it."
    Rails.logger.error e.message
    render json: { message: 'logged out' }, status: :ok
    # render json: { error: e.message }, status: :unauthorized
  end
end