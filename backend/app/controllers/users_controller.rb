class UsersController < ApplicationController
  include AuthenticationHelper

  def create
    invalid_company_url = false
    begin
      params[:company_url] = "https://#{params[:company_url]}" if !params[:company_url].starts_with?('http')
      parsed_company_url = URI.parse(params[:company_url])
      invalid_company_url = true if parsed_company_url.hostname.blank?
    rescue => e
      invalid_company_url = true
    end
    if invalid_company_url
      render json: { error: "Invalid company URL provided (#{params[:company_url]})." }
      return
    end
    user = User.new(user_params)
    workspace = Workspace.new(name: parsed_company_url.hostname, company_url: parsed_company_url.to_s)
    if user.valid? && workspace.save && user.save
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