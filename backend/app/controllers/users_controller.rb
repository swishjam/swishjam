class UsersController < ApplicationController
  def create
    user = User.new(user_params)
    organization = Organization.new(name: params[:organization_name], url: params[:organization_url])
    if user.valid? && organization.valid? && user.save && organization.save
      token = log_user_in(user, organization)
      render json: { user: user, token: token }, status: :ok
    else
      render json: { error: (user.errors.full_messages + organization.errors.full_messages).join(' ') }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.permit(:email, :password)
  end
end