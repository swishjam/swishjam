class SessionsController < ApplicationController
  include AuthenticationHelper

  def create
    user = User.find_by(email: params[:email])
    if user && user.authenticate(params[:password])
      workspace = user.workspaces.first
      token = log_user_in(user, workspace)
      render json: { 
        token: token, 
        user: { 
          id: user.id, 
          email: user.email, 
          first_name: user.first_name, 
          last_name: user.last_name 
        },
        workspace: {
          id: workspace.id,
          name: workspace.name,
          company_url: workspace.company_url,
        }
      }, status: :ok
    else
      render json: { error: 'Invalid email or password.' }, status: :unprocessable_entity
    end
  end

  def destroy
    log_user_out
    render json: { message: 'logged out' }, status: :ok
  rescue => e
    Rails.logger.error "Failed to log user out, but going to return 200 anyway to allow it."
    Rails.logger.error e.message
    render json: { message: 'logged out' }, status: :ok
  end
end