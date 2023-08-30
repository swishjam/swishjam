class UsersController < ApplicationController
  include AuthenticationHelper

  def create
    user = User.new(user_params)
    workspace = Workspace.new(name: params[:workspace_name], company_url: params[:company_url])
    if user.valid? && workspace.save
      user.workspaces << workspace
      token = log_user_in(user, workspace)
      render json: { 
        user: user.attributes.except('password_digest', 'jwt_secret_key'), 
        workspace: workspace, 
        token: token 
      }, status: :ok
    else
      render json: { error: (user.errors.full_messages + workspace.errors.full_messages).join(' ') }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.permit(:email, :password)
  end
end