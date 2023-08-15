class UsersController < ApplicationController
  def create
    user = Swishjam::User.new(user_params)
    organization = Swishjam::Organization.new(name: params[:organization_name], url: params[:organization_url])
    if user.valid? && organization.valid? && user.save && organization.save
      user.organizations << organization
      token = log_user_in(user, organization)
      render json: { 
        user: user.attributes.except('password_digest', 'jwt_secret_key'), 
        organization: organization, 
        token: token 
      }, status: :ok
    else
      render json: { error: (user.errors.full_messages + organization.errors.full_messages).join(' ') }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.permit(:email, :password)
  end
end