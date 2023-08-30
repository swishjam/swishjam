class SessionsController < ApplicationController
  include AuthenticationHelper

  def create
    user = User.find_by(email: params[:email])
    if user && user.authenticate(params[:password])
      token = log_user_in(user, user.workspaces.first)
      render json: { 
        token: token, 
        user: { 
          id: user.id, 
          email: user.email, 
          first_name: user.first_name, 
          last_name: user.last_name 
        }, 
      }, status: :ok
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